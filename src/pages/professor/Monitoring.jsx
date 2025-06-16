import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const LearningMonitoring = () => {
  const navigate = useNavigate();
  const [monitoringData, setMonitoringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isSessionRegistered, setIsSessionRegistered] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    initializePage();
    
    return () => {
      cleanup();
    };
  }, []);

  // 새벽 활동 감지 알림
  useEffect(() => {
    if (monitoringData?.student_activities) {
      const nightActiveStudents = monitoringData.student_activities.filter(
        student => student.diagnosis_stats?.night_tests >= 7
      );
      
      if (nightActiveStudents.length > 0) {
        console.warn('🌙 새벽 활동 학생 감지:', nightActiveStudents.map(s => 
          `${s.student_name}(${s.student_department}): ${s.diagnosis_stats.night_tests}회 새벽 테스트`
        ));
        
        // 새벽 활동 Toast 알림 (선택적)
        if (window.confirm(
          `🌙 새벽 활동 감지!\n\n${nightActiveStudents.length}명의 학생이 새벽 시간대에 7회 이상 진단테스트를 수행했습니다.\n\n상세 내용:\n${
            nightActiveStudents.map(s => `• ${s.student_name}(${s.student_department}): ${s.diagnosis_stats.night_tests}회`).join('\n')
          }\n\n학생별 상세 분석을 확인하시겠습니까?`
        )) {
          // 첫 번째 학생의 상세 페이지로 이동
          viewStudentDetails(nightActiveStudents[0].student_id);
        }
      }
    }
  }, [monitoringData]);

  const initializePage = async () => {
    try {
      await registerProfessorSession();
      await loadMonitoringData();
      startRealtimeUpdates();
    } catch (error) {
      console.error('페이지 초기화 실패:', error);
    }
  };

  const registerProfessorSession = async () => {
    try {
      await apiClient.post('/professor/session/start');
      setIsSessionRegistered(true);
      console.log('교수 세션 등록 완료');
    } catch (error) {
      console.error('세션 등록 실패:', error);
    }
  };

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/professor/monitoring');
      
      if (response.data.success) {
      setMonitoringData(response.data);
        updateNotificationCount(response.data.monitoring_summary);
      } else {
        throw new Error('데이터 로드 실패');
      }
    } catch (error) {
      console.error('모니터링 데이터 로드 실패:', error);
      alert('모니터링 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const startRealtimeUpdates = () => {
    // 실시간 알림 체크 (30초마다)
    const notificationInterval = setInterval(refreshNotifications, 30000);
    
    // 전체 데이터 새로고침 (60초마다)
    const dataInterval = setInterval(loadMonitoringData, 60000);
    
    setRefreshInterval({ notification: notificationInterval, data: dataInterval });
  };

  const refreshNotifications = async () => {
    try {
      const response = await apiClient.get('/professor/alerts');
      if (response.data.success) {
        setNotificationCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error('알림 새로고침 실패:', error);
    }
  };

  const updateNotificationCount = (summary) => {
    const totalUnread = (summary.realtime_unread || 0) + (summary.new_alerts || 0);
    setNotificationCount(totalUnread);
  };

  const autoMatchStudents = async () => {
    try {
      const response = await apiClient.post('/professor/students/auto-match');
      if (response.data.success) {
        alert('✅ 학생 자동 매칭이 완료되었습니다!');
        await loadMonitoringData();
      } else {
        throw new Error(response.data.message || '자동 매칭 실패');
      }
    } catch (error) {
      console.error('자동 매칭 실패:', error);
      alert('❌ 자동 매칭에 실패했습니다: ' + error.message);
    }
  };

  const approveStudentMatch = async (matchId, approved) => {
    try {
      const response = await apiClient.post(`/professor/students/${matchId}/approve`, {
        approved: approved,
        reason: approved ? '교수 승인' : '교수 거부'
      });
      
      if (response.data.success) {
        alert(`✅ 학생 매칭이 ${approved ? '승인' : '거부'}되었습니다!`);
        await loadMonitoringData();
      } else {
        throw new Error(response.data.error || '매칭 처리 실패');
      }
    } catch (error) {
      console.error('매칭 처리 실패:', error);
      alert('❌ 매칭 처리에 실패했습니다: ' + error.message);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const response = await apiClient.post('/professor/alerts/mark-all-read');
      if (response.data.success) {
        setNotificationCount(0);
        await loadMonitoringData();
      }
    } catch (error) {
      console.error('알림 처리 실패:', error);
    }
  };

  const viewStudentDetails = (studentId) => {
    window.open(`/professor/students/${studentId}/analysis`, '_blank');
  };

  const simulateTest = async () => {
    try {
      // 랜덤 학생 ID 선택 (승인된 학생 중에서)
      const availableStudents = monitoringData?.student_activities || [];
      if (availableStudents.length === 0) {
        alert('⚠️ 매칭된 학생이 없습니다. 먼저 자동 매칭을 실행해주세요.');
        return;
      }
      
      const randomStudent = availableStudents[Math.floor(Math.random() * availableStudents.length)];
      const randomScore = Math.floor(Math.random() * 40) + 60; // 60-99점
      const isNightTest = Math.random() < 0.3; // 30% 확률로 새벽 테스트
      
      const response = await apiClient.post('/professor/test/simulate-diagnosis', {
        student_id: randomStudent.student_id,
        score: randomScore,
        test_type: "모의진단테스트",
        total_questions: 30,
        correct_answers: Math.round((randomScore / 100) * 30),
        time_taken: Math.floor(Math.random() * 1800) + 600, // 10분~30분
        is_night_test: isNightTest
      });
      
      if (response.data.success) {
        const studentName = randomStudent.student_name;
        const timeIndicator = isNightTest ? '🌙 새벽' : '📊';
        
        alert(`🧪 시뮬레이션 완료!\n\n${studentName} 학생이 ${timeIndicator} 진단테스트를 완료했습니다.\n점수: ${randomScore}점\n\n2초 후 알림이 업데이트됩니다.`);
        
        // 2초 후 데이터 새로고침
        setTimeout(() => {
          loadMonitoringData();
          refreshNotifications();
        }, 2000);
      }
    } catch (error) {
      console.error('시뮬레이션 실패:', error);
      alert('❌ 시뮬레이션 실패: ' + (error.response?.data?.detail || error.message));
    }
  };

  const cleanup = async () => {
    if (refreshInterval) {
      if (refreshInterval.notification) clearInterval(refreshInterval.notification);
      if (refreshInterval.data) clearInterval(refreshInterval.data);
    }
    
    if (isSessionRegistered) {
      try {
        await apiClient.post('/professor/session/end');
      } catch (error) {
        console.error('세션 해제 실패:', error);
      }
    }
  };

  const getActivityStatusIcon = (status) => {
    switch (status) {
      case 'active': return { icon: '🟢', text: '활성' };
      case 'inactive': return { icon: '⚪', text: '비활성' };
      case 'concern': return { icon: '🔴', text: '주의' };
      default: return { icon: '⚪', text: '알 수 없음' };
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '활동 없음';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">학습 모니터링 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!monitoringData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">데이터를 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-4">모니터링 데이터를 불러오지 못했습니다.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  const { professor_info, monitoring_summary, student_activities, ios_style_alerts, pending_matches } = monitoringData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/professor')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 대시보드
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📊</div>
                <h1 className="text-xl font-bold text-gray-900">학습 모니터링</h1>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {professor_info.name} 교수 ({professor_info.department})
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* 실시간 알림 뱃지 */}
              <button
                onClick={markAllNotificationsRead}
                className={`relative bg-red-500 text-white px-3 py-2 rounded-full hover:bg-red-600 transition-all ${
                  notificationCount > 0 ? 'animate-pulse' : ''
                }`}
              >
                🔔 {notificationCount}
              </button>
              
              {/* 자동 매칭 버튼 */}
              <button
                onClick={autoMatchStudents}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all"
              >
                👥 자동 매칭
              </button>
              
              {/* 새로고침 버튼 */}
              <button
                onClick={loadMonitoringData}
                className="bg-white text-gray-600 px-3 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                🔄
              </button>

              {/* 개발용 테스트 버튼 */}
              {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
                <button
                  onClick={simulateTest}
                  className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  🧪 테스트
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{monitoring_summary.total_students}</div>
                <div className="text-sm text-gray-600 font-medium">전체 학생</div>
                </div>
              <div className="bg-indigo-100 p-3 rounded-xl">
                <div className="text-indigo-600 text-xl">👥</div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{monitoring_summary.active_students}</div>
                <div className="text-sm text-gray-600 font-medium">활성 학생</div>
                </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <div className="text-green-600 text-xl">✅</div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{monitoring_summary.new_alerts}</div>
                <div className="text-sm text-gray-600 font-medium">새 알림</div>
                </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <div className="text-orange-600 text-xl">🔔</div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{monitoring_summary.pending_matches}</div>
                <div className="text-sm text-gray-600 font-medium">대기 매칭</div>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <div className="text-red-600 text-xl">⏳</div>
                </div>
              </div>
            </div>
          </div>

        {/* 메인 콘텐츠 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 학생 활동 현황 (좌측 2/3) */}
          <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <span>📈</span>
                <span>학생 활동 현황</span>
              </h3>
              <div className="text-sm text-gray-500">
                실시간 업데이트: {new Date().toLocaleTimeString('ko-KR')}
                  </div>
                </div>
                
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {student_activities?.length > 0 ? (
                student_activities.map((student) => {
                  const statusInfo = getActivityStatusIcon(student.activity_status);
                  const nightTests = student.diagnosis_stats?.night_tests || 0;
                  const isNightActive = nightTests >= 7;
                  
                  return (
                    <div
                      key={student.student_id}
                      onClick={() => viewStudentDetails(student.student_id)}
                      className={`p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border-l-4 ${
                        isNightActive ? 'border-purple-500 bg-purple-50' : 'border-indigo-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            isNightActive ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                          }`}>
                            {student.student_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center space-x-2">
                              <span>{student.student_name}</span>
                              <span className="text-lg">{statusInfo.icon}</span>
                              {isNightActive && <span className="text-lg">🌙</span>}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center space-x-3 flex-wrap">
                              <span className="font-medium">{student.school}</span>
                              <span>•</span>
                              <span>{student.department}</span>
                              <span>•</span>
                              <span>{student.test_count}회 테스트</span>
                              {student.recent_score && (
                                <>
                                  <span>•</span>
                                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getScoreColor(student.recent_score)}`}>
                                    {student.recent_score}점
                                  </span>
                                </>
                              )}
                              {student.diagnosis_stats?.recent_24h > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600 font-medium">
                                    24시간: {student.diagnosis_stats.recent_24h}회
                                  </span>
                                </>
                              )}
                              {nightTests > 0 && (
                                <>
                                  <span>•</span>
                                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                    isNightActive ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    🌙 새벽 {nightTests}회
                                  </span>
                                </>
                              )}
                            </div>
                            {isNightActive && (
                              <div className="text-xs text-purple-600 font-medium mt-1">
                                ⚠️ 새벽 시간대 과도한 활동 감지
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>최근 활동</div>
                          <div>{formatDateTime(student.last_diagnosis_test?.created_at)}</div>
                          {student.diagnosis_stats?.avg_score > 0 && (
                            <div className="text-xs mt-1">
                              평균: {student.diagnosis_stats.avg_score}점
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">👥</div>
                  <div className="text-lg font-medium">등록된 학생이 없습니다</div>
                  <div className="text-sm mt-2">자동 매칭을 실행해보세요</div>
                </div>
              )}
              </div>
            </div>

          {/* 사이드바 (우측 1/3) */}
            <div className="space-y-6">
            {/* iOS 스타일 실시간 알림 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <span>📱</span>
                  <span>실시간 알림</span>
                </h3>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  모두 읽음
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {ios_style_alerts?.length > 0 ? (
                  ios_style_alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => viewStudentDetails(alert.student_name)}
                      className={`p-4 rounded-xl cursor-pointer transition-all transform hover:scale-102 ${
                        alert.priority === 'high' 
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      }`}
                    >
                      <div className="font-semibold text-sm flex items-center space-x-2">
                        <span>{alert.title}</span>
                      </div>
                      <div className="text-sm opacity-90 mt-1">
                        {alert.message}
                      </div>
                      <div className="text-xs opacity-75 mt-2">
                        {formatDateTime(alert.created_at)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">🔕</div>
                    <div className="text-sm">새 알림이 없습니다</div>
                  </div>
                )}
                      </div>
                    </div>

            {/* 매칭 대기 학생 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-4">
                <span>👋</span>
                <span>매칭 대기</span>
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pending_matches?.length > 0 ? (
                  pending_matches.map((match) => (
                    <div key={match.match_id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900">{match.student_name}</div>
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">{match.student_school}</span>
                        <span className="mx-1">•</span>
                        <span>{match.student_department}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveStudentMatch(match.match_id, true)}
                          className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                        >
                          ✅ 승인
                        </button>
                        <button
                          onClick={() => approveStudentMatch(match.match_id, false)}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
                        >
                          ❌ 거부
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-sm">대기 중인 매칭이 없습니다</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearningMonitoring;
// Monitoring으로도 export (기존 import 호환)
export { LearningMonitoring as Monitoring }; 