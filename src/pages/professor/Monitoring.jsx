import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const Monitoring = () => {
  const navigate = useNavigate();
  const [monitoringData, setMonitoringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    loadMonitoringData();
    
    // 30초마다 자동 새로고침
    const interval = setInterval(loadMonitoringData, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadMonitoringData = async () => {
    try {
      const response = await apiClient.get('/professor/monitoring');
      setMonitoringData(response.data);
    } catch (error) {
      console.error('모니터링 데이터 로드 실패:', error);
      alert('모니터링 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal': return '정상';
      case 'warning': return '주의';
      case 'critical': return '위험';
      case 'inactive': return '비활성';
      default: return '알 수 없음';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '없음';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">모니터링 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!monitoringData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ 데이터를 불러올 수 없습니다</div>
          <p className="text-gray-600">모니터링 데이터를 불러오지 못했습니다.</p>
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
              <button
                onClick={() => navigate('/professor')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← 대시보드로 돌아가기
              </button>
              <h1 className="text-xl font-bold text-gray-900">🔍 실시간 학생 모니터링</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadMonitoringData}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                새로고침
              </button>
              {currentUser && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{currentUser.school}</span> | 
                  <span className="font-medium"> {currentUser.department}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 요약 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">전체 학생</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  {monitoringData.summary.total_students}명
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">온라인 학생</div>
                <div className="mt-1 text-2xl font-semibold text-green-600">
                  {monitoringData.summary.online_students}명
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">위험 학생</div>
                <div className="mt-1 text-2xl font-semibold text-red-600">
                  {monitoringData.summary.critical_students}명
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">평균 출석률</div>
                <div className="mt-1 text-2xl font-semibold text-blue-600">
                  {monitoringData.summary.avg_attendance_rate}%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 학생 상태 목록 */}
            <div className="lg:col-span-2 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">학생 실시간 상태</h3>
                  <div className="text-xs text-gray-500">
                    마지막 업데이트: {new Date().toLocaleTimeString('ko-KR')}
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {monitoringData.students.map((student) => (
                    <div key={student.student_id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center relative">
                              <span className="text-sm font-medium text-blue-600">
                                {student.name.charAt(0)}
                              </span>
                              {/* 온라인 상태 표시 */}
                              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                student.is_online ? 'bg-green-500' : 'bg-gray-400'
                              }`}></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                                {getStatusText(student.status)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">@{student.user_id}</p>
                            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                              <span>현재: {student.current_activity}</span>
                              <span>출석률: {student.attendance_rate}%</span>
                              {student.warning_count > 0 && (
                                <span className="text-red-500">경고 {student.warning_count}건</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>마지막 활동</div>
                          <div>{formatDateTime(student.last_activity)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 알림 및 경고 */}
            <div className="space-y-6">
              {/* 실시간 알림 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🚨 실시간 알림</h3>
                  {monitoringData.alerts.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-gray-400 text-lg mb-2">✅</div>
                      <p className="text-gray-500 text-sm">현재 알림이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {monitoringData.alerts.map((alert, index) => (
                        <div key={index} className={`p-3 border rounded-lg ${getAlertColor(alert.type)}`}>
                          <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0">
                              {alert.type === 'critical' ? (
                                <span className="text-red-500">🔴</span>
                              ) : (
                                <span className="text-yellow-500">🟡</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{alert.student}</p>
                              <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDateTime(alert.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 상태별 통계 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">상태별 통계</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">정상</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {monitoringData.students.filter(s => s.status === 'normal').length}명
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">주의</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {monitoringData.summary.warning_students}명
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">위험</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {monitoringData.summary.critical_students}명
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">비활성</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {monitoringData.students.filter(s => s.status === 'inactive').length}명
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 온라인/오프라인 현황 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">접속 현황</h3>
                  <div className="space-y-4">
                    {/* 온라인 비율 시각화 */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>온라인</span>
                        <span>{monitoringData.summary.online_students}/{monitoringData.summary.total_students}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${monitoringData.summary.total_students > 0 
                              ? (monitoringData.summary.online_students / monitoringData.summary.total_students) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* 평균 출석률 */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>평균 출석률</span>
                        <span>{monitoringData.summary.avg_attendance_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${monitoringData.summary.avg_attendance_rate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Monitoring; 