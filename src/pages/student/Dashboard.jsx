import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api.js';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [diagnosticStatus, setDiagnosticStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleError, setRoleError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('StudentDashboard - 토큰 존재:', !!token);
    console.log('StudentDashboard - 사용자 데이터:', userData);
    
    if (!token) {
      console.log('토큰 없음 - 로그인 페이지로 이동');
      navigate('/login');
      return;
    }

    if (userData) {
      const user = JSON.parse(userData);
      console.log('StudentDashboard - 사용자 정보:', user);
      console.log('StudentDashboard - 사용자 역할:', user.role);
      
      // 학생 역할이 아닌 경우 접근 차단
      if (user.role !== 'student') {
        console.log('학생 권한 없음 - 역할:', user.role);
        setRoleError(true);
        setLoading(false);
        
        // 역할에 따라 적절한 대시보드로 리다이렉트
        setTimeout(() => {
          switch (user.role) {
            case 'professor':
              navigate('/professor');
              break;
            case 'admin':
              navigate('/admin');
              break;
            case 'unverified':
            case null:
            case undefined:
            case '':
            default:
              navigate('/dashboard/unverified');
              break;
          }
        }, 3000);
        return;
      }
      
      setUser(user);
    } else {
      console.log('사용자 데이터 없음 - 로그인 페이지로 이동');
      navigate('/login');
      return;
    }

    loadUserData();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      // 진단테스트 상태 확인
      const diagnosticResponse = await apiClient.get('/auth/diagnostic-test-status');
      setDiagnosticStatus(diagnosticResponse.data.data);
      
      // 진단테스트가 완료된 경우에만 대시보드 데이터 로드
      if (diagnosticResponse.data.data.diagnostic_test_completed) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('사용자 데이터 로드 실패:', error);
      // 기본 진단테스트 상태 설정
      setDiagnosticStatus({
        diagnostic_test_completed: false,
        diagnostic_test_completed_at: null,
        can_access_features: false
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const response = await apiClient.get('/dashboard/overview');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      // 임시 더미 데이터
      setDashboardData({
        current_level: 0.75,
        total_problems_solved: 145,
        current_streak: 7,
        level_change: 0.12,
        recent_activities: [
          { type: 'test', subject: '자료구조', score: 85, date: '2024-01-15' },
          { type: 'problem', subject: '알고리즘', count: 5, date: '2024-01-14' },
          { type: 'diagnosis', subject: '프로그래밍', score: 92, date: '2024-01-13' }
        ],
        upcoming_deadlines: [
          { subject: '데이터베이스', title: '중간고사', date: '2024-01-25' },
          { subject: '네트워크', title: '과제 제출', date: '2024-01-22' }
        ]
      });
    }
  };

  const handleStartDiagnosticTest = () => {
    navigate('/diagnosis');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('autoLogin');
    navigate('/');
  };

  const handleFeatureClick = async (feature) => {
    // 🎯 학습분석 클릭 시 사용자 상태 새로고침
    if (feature === 'analysis') {
      try {
        // 최신 진단테스트 상태 확인
        const statusResponse = await apiClient.get('/auth/diagnostic-test-status');
        const latestStatus = statusResponse.data.data;
        
        if (!latestStatus.diagnostic_test_completed) {
          alert('1차 진단테스트를 먼저 완료해주세요. 진단테스트 완료 후 학습분석을 이용하실 수 있습니다.');
          return;
        }
        
        // 상태 업데이트 후 페이지 이동
        setDiagnosticStatus(latestStatus);
        navigate('/student/analysis');
        return;
      } catch (error) {
        console.error('❌ 진단테스트 상태 확인 실패:', error);
        alert('상태 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        return;
      }
    }
    
    // 기타 기능들은 기존 로직 사용
    if (!diagnosticStatus?.diagnostic_test_completed) {
      alert('진단테스트를 먼저 완료해주세요. 진단테스트 완료 후 모든 기능을 이용하실 수 있습니다.');
      return;
    }
    
    // 진단테스트 완료 시 기능 이용 가능
    switch (feature) {
      case 'problems':
        navigate('/problems');
        break;
      case 'learning':
        navigate('/learning');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 역할 오류 화면
  if (roleError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">접근 권한이 없습니다</h2>
          <p className="mt-2 text-gray-600">
            이 페이지는 재학생만 이용할 수 있습니다.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            잠시 후 적절한 페이지로 이동합니다...
          </p>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/kbulogo.png" alt="경복대학교 로고" className="h-8 w-auto" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">캠퍼스온</h1>
              <span className="ml-4 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                재학생
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">안녕하세요, {user?.name || user?.user_id}님</span>
              
              <button
                onClick={() => navigate('/my')}
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
                title="프로필"
              >
                {user?.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt="프로필" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 네비게이션 메뉴 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button className="border-b-2 border-red-500 text-red-600 px-1 py-4 text-sm font-medium">
              대시보드
            </button>
            <button 
              className={`border-b-2 border-transparent px-1 py-4 text-sm font-medium ${
                diagnosticStatus?.diagnostic_test_completed 
                  ? 'text-gray-500 hover:text-gray-700 hover:border-gray-300' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              onClick={() => handleFeatureClick('learning')}
              disabled={!diagnosticStatus?.diagnostic_test_completed}
            >
              학습하기
            </button>
            <button 
              className={`border-b-2 border-transparent px-1 py-4 text-sm font-medium ${
                diagnosticStatus?.diagnostic_test_completed 
                  ? 'text-gray-500 hover:text-gray-700 hover:border-gray-300' 
                  : 'text-red-500 hover:text-red-700 hover:border-red-300'
              }`}
              onClick={handleStartDiagnosticTest}
            >
              {diagnosticStatus?.diagnostic_test_completed ? '진단테스트 (다음 회차)' : '진단테스트 (1차)'}
            </button>
            <button 
              className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              onClick={() => handleFeatureClick('analysis')}
            >
              학습분석
            </button>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 진단테스트 미완료 시 안내 화면 */}
          {!diagnosticStatus?.diagnostic_test_completed ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-32 w-32 rounded-full bg-yellow-100 mb-6">
                    <span className="text-6xl">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    진단테스트를 완료해주세요
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    맞춤형 학습을 위해 먼저 진단테스트를 완료해주세요.<br/>
                    진단테스트를 통해 현재 학습 수준을 파악하고, 개인별 맞춤 학습 계획을 제공해드립니다.<br/>
                    <span className="font-semibold text-red-600">진단테스트 완료 후 모든 기능을 이용하실 수 있습니다.</span>
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 진단테스트 안내</h3>
                    <ul className="text-left text-blue-800 space-y-2">
                      <li>• 소요시간: 약 20-30분</li>
                      <li>• 문제 수: 다양한 분야의 문제들</li>
                      <li>• 목적: 현재 학습 수준 파악 및 맞춤형 학습 계획 수립</li>
                      <li>• 결과: 개인별 강점/약점 분석 및 추천 학습 경로 제공</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleStartDiagnosticTest}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg"
                    >
                      🚀 진단테스트 시작하기
                    </button>
                    
                    <div className="text-sm text-gray-500">
                      진단테스트는 언제든지 다시 응시할 수 있습니다.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 진단테스트 완료 후 기존 대시보드 내용
            <>
              {/* 환영 메시지 */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">
                    📚 학습 대시보드에 오신 것을 환영합니다!
                  </h2>
                  <p className="text-blue-100">
                    개인 맞춤형 학습 관리로 더 효율적인 공부를 시작해보세요.
                  </p>
                  {diagnosticStatus?.diagnostic_test_completed_at && (
                    <p className="text-blue-200 text-sm mt-2">
                      ✅ 진단테스트 완료: {new Date(diagnosticStatus.diagnostic_test_completed_at).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </div>
              </div>

              {/* 핵심 지표 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">📊</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            현재 학습 수준
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {Math.round(dashboardData.current_level * 100)}%
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">✅</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            해결한 문제
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {dashboardData.total_problems_solved}개
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">🔥</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            연속 학습
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {dashboardData.current_streak}일
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">📈</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            변화량
                          </dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {dashboardData.level_change > 0 ? '+' : ''}{Math.round(dashboardData.level_change * 100)}%
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 빠른 액션 */}
                <div className="lg:col-span-2">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">빠른 학습</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                          onClick={() => handleFeatureClick('problems')}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-2xl mb-2">📚</div>
                          <div className="text-sm font-medium text-gray-900">문제 풀기</div>
                          <div className="text-xs text-gray-500">새로운 문제 도전</div>
                        </button>
                        <button 
                          onClick={handleStartDiagnosticTest}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-2xl mb-2">🎯</div>
                          <div className="text-sm font-medium text-gray-900">진단 테스트</div>
                          <div className="text-xs text-gray-500">다음 회차 진행</div>
                        </button>
                        <button 
                          onClick={() => handleFeatureClick('analysis')}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="text-2xl mb-2">📊</div>
                          <div className="text-sm font-medium text-gray-900">학습 분석</div>
                          <div className="text-xs text-gray-500">진단테스트 이력 보기</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 최근 활동 */}
                  <div className="bg-white overflow-hidden shadow rounded-lg mt-6">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">최근 학습 활동</h3>
                      <div className="space-y-3">
                        {dashboardData.recent_activities.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 text-sm">
                                    {activity.type === 'test' ? '📝' : activity.type === 'problem' ? '💡' : '🎯'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {activity.subject} {activity.type === 'test' ? '테스트' : activity.type === 'problem' ? '문제 풀이' : '진단'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {activity.score ? `점수: ${activity.score}점` : `${activity.count}문제 해결`}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{activity.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 사이드바 */}
                <div className="space-y-6">
                  {/* 다가오는 일정 */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">다가오는 일정</h3>
                      <div className="space-y-3">
                        {dashboardData.upcoming_deadlines.map((deadline, index) => (
                          <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <span className="text-yellow-600">⏰</span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                                <p className="text-xs text-gray-500">{deadline.subject}</p>
                                <p className="text-xs text-yellow-700">{deadline.date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 학습 목표 */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">오늘의 목표</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">문제 풀이</span>
                          <span className="text-sm font-medium text-gray-900">5/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '50%'}}></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">학습 시간</span>
                          <span className="text-sm font-medium text-gray-900">45/120분</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '37.5%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
