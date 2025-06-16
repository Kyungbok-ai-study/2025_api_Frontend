import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api.js';

const ProfessorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleError, setRoleError] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [monitoringData, setMonitoringData] = useState(null);
  const [reportsData, setReportsData] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('ProfessorDashboard - 토큰 존재:', !!token);
    console.log('ProfessorDashboard - 사용자 데이터:', userData);
    
    if (!token) {
      console.log('토큰 없음 - 로그인 페이지로 이동');
      navigate('/login');
      return;
    }

    if (userData) {
      const user = JSON.parse(userData);
      console.log('ProfessorDashboard - 사용자 정보:', user);
      console.log('ProfessorDashboard - 사용자 역할:', user.role);
      
      // 교수 역할이 아닌 경우 접근 차단
      if (user.role !== 'professor') {
        console.log('교수 권한 없음 - 역할:', user.role);
        setRoleError(true);
        setLoading(false);
        
        // 역할에 따라 적절한 대시보드로 리다이렉트
        setTimeout(() => {
          switch (user.role) {
            case 'student':
              navigate('/student');
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

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      console.log('교수 대시보드 데이터 로딩 시작');
      
      const dashboardResponse = await apiClient.get('/professor/dashboard');
      setDashboardData(dashboardResponse.data);
      console.log('교수 대시보드 데이터 로딩 완료:', dashboardResponse.data);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      // 오류 시에도 기본 데이터 설정
      setDashboardData({
        total_students: 0,
        active_students: 0,
        critical_students: 0,
        warning_students: 0,
        pending_assignments: 0,
        class_average_score: 0,
        recent_submissions: [],
        warnings: [],
        activity_heatmap: []
      });
    } finally {
      console.log('교수 대시보드 로딩 상태 완료');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('autoLogin');
    navigate('/');
  };

  if (loading) {
    console.log('교수 대시보드 로딩 중...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">교수 대시보드 로딩 중...</p>
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
            이 페이지는 교수만 이용할 수 있습니다.
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

  if (!dashboardData) {
    console.log('교수 대시보드 데이터 없음');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ 데이터를 불러올 수 없습니다</div>
          <p className="text-gray-600">교수 대시보드 데이터를 불러오지 못했습니다.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  console.log('교수 대시보드 렌더링 시작, 데이터:', dashboardData);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/kbulogo.png" alt="경복대학교 로고" className="h-8 w-auto" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">캠퍼스온</h1>
              <span className="ml-4 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                교수
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">안녕하세요, {user?.name || user?.user_id} 교수님</span>
              
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
              onClick={() => navigate('/professor/assignments')}
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              과제 관리
            </button>
            <button 
              onClick={() => navigate('/professor/analytics')}
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              학습 분석
            </button>
            <button 
              onClick={() => navigate('/professor/monitoring')}
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              학생 모니터링
            </button>
            <button 
              onClick={() => navigate('/professor/problems')}
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              🧠 문제 생성
            </button>
            <button 
              onClick={() => navigate('/professor/rag-update')}
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              📚 RAG 업데이트
            </button>
            <button 
              onClick={() => navigate('/professor/question-review')}
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              문제 검토
            </button>

            <button 
              onClick={() => navigate('/professor/reports')}
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-1 py-4 text-sm font-medium"
            >
              리포트
            </button>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 환영 메시지 */}
          <div className="bg-gradient-to-r from-green-500 to-teal-600 overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">
                👨‍🏫 교수님 대시보드에 오신 것을 환영합니다!
              </h2>
              <p className="text-green-100">
                효율적인 강의 관리와 학생 성과 분석을 위한 통합 관리 시스템입니다.
              </p>
            </div>
          </div>

          {/* 핵심 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        전체 학생 수
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.total_students}명
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
                        활성 학생
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.active_students}명
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
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📝</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        대기 중인 과제
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardData.pending_assignments}건
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
                      <span className="text-white text-sm font-bold">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        반 평균 점수
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {(dashboardData.class_average_score || 0).toFixed(1)}점
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
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">빠른 관리</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button 
                      onClick={() => navigate('/professor/assignments')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-2xl mb-2">📝</div>
                      <div className="text-sm font-medium text-gray-900">과제 생성</div>
                      <div className="text-xs text-gray-500">새로운 과제 등록</div>
                    </button>
                    <button 
                      onClick={() => navigate('/professor/problems')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-2xl mb-2">🧠</div>
                      <div className="text-sm font-medium text-gray-900">RAG 문제 생성</div>
                      <div className="text-xs text-gray-500">AI 기반 문제 생성</div>
                    </button>
                    <button 
                      onClick={() => navigate('/professor/rag-update')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-2xl mb-2">📚</div>
                      <div className="text-sm font-medium text-gray-900">RAG 업데이트</div>
                      <div className="text-xs text-gray-500">지식베이스 관리</div>
                    </button>
                    <button 
                      onClick={() => navigate('/professor/analytics')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm font-medium text-gray-900">학습 분석</div>
                      <div className="text-xs text-gray-500">성과 리포트 생성</div>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <button 
                      onClick={() => navigate('/professor/deepseek-learning')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <div className="text-2xl mb-2">🤖</div>
                      <div className="text-sm font-medium text-gray-900">딥시크 학습</div>
                      <div className="text-xs text-gray-500">AI 모델 학습 관리</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* 학습 위기 경고 */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🚨 학습 위기 경고</h3>
                  {(dashboardData.warnings?.length || 0) === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-lg mb-2">✅</div>
                      <p className="text-gray-500 text-sm">현재 경고 사항이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(dashboardData.warnings || []).map((warning, index) => (
                        <div key={index} className={`p-3 border rounded-lg ${
                          warning.severity === 'critical' ? 'bg-red-50 border-red-200' :
                          warning.severity === 'high' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-orange-50 border-orange-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                warning.severity === 'critical' ? 'text-red-900' :
                                warning.severity === 'high' ? 'text-yellow-900' :
                                'text-orange-900'
                              }`}>{warning.student}</p>
                              <p className={`text-xs ${
                                warning.severity === 'critical' ? 'text-red-700' :
                                warning.severity === 'high' ? 'text-yellow-700' :
                                'text-orange-700'
                              }`}>{warning.description}</p>
                            </div>
                            <span className={`text-xs ${
                              warning.severity === 'critical' ? 'text-red-600' :
                              warning.severity === 'high' ? 'text-yellow-600' :
                              'text-orange-600'
                            }`}>
                              {warning.severity === 'critical' ? '위험' :
                               warning.severity === 'high' ? '주의' : '관찰'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 학습 현황 히트맵 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📈 학습 활동 히트맵</h3>
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {/* 요일 헤더 */}
                    {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                      <div key={day} className="text-xs text-center text-gray-500 p-1">{day}</div>
                    ))}
                    {/* 히트맵 데이터 */}
                    {(dashboardData.activity_heatmap || []).map((activity, i) => (
                      <div 
                        key={i} 
                        className={`h-8 rounded ${
                          activity.level === 4 ? 'bg-green-500' : 
                          activity.level === 3 ? 'bg-green-400' :
                          activity.level === 2 ? 'bg-green-300' : 
                          activity.level === 1 ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                        title={`${activity.date}: 활동 ${activity.count}건`}
                      ></div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>적음</span>
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-gray-100 rounded"></div>
                      <div className="w-3 h-3 bg-green-100 rounded"></div>
                      <div className="w-3 h-3 bg-green-300 rounded"></div>
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                    </div>
                    <span>많음</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 담당 학생 현황 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">👥 담당 학생 현황</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">전체 학생</span>
                      <span className="text-sm font-medium text-gray-900">{dashboardData.total_students}명</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">활성 학생</span>
                      <span className="text-sm font-medium text-green-600">{dashboardData.active_students}명</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">위험 학생</span>
                      <span className="text-sm font-medium text-red-600">{dashboardData.critical_students}명</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">주의 학생</span>
                      <span className="text-sm font-medium text-yellow-600">{dashboardData.warning_students}명</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 최근 과제 제출 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📋 최근 과제 제출</h3>
                  {(dashboardData.recent_submissions?.length || 0) === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">최근 제출물이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(dashboardData.recent_submissions || []).map((submission, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{submission.student}</p>
                              <p className="text-xs text-gray-500">{submission.course}</p>
                              <p className="text-xs text-blue-700">{submission.assignment}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">{submission.score}점</p>
                              <p className="text-xs text-gray-400">{submission.date}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 네비게이션 메뉴 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">관리 메뉴</h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => navigate('/professor/assignments')}
                className="flex items-center p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-blue-600 mr-3">📝</span>
                <div>
                  <div className="font-medium text-gray-900">과제 관리</div>
                  <div className="text-sm text-gray-500">과제 생성, 수정, 채점</div>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/professor/problems')}
                className="flex items-center p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-purple-600 mr-3">🧠</span>
                <div>
                  <div className="font-medium text-gray-900">AI 문제 등록</div>
                  <div className="text-sm text-gray-500">문제 파일 업로드 및 AI 학습</div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/professor/students')}
                className="flex items-center p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-green-600 mr-3">👥</span>
                <div>
                  <div className="font-medium text-gray-900">학생 관리</div>
                  <div className="text-sm text-gray-500">담당 학생 현황 및 관리</div>
                </div>
              </button>
              
              <button className="flex items-center p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-yellow-600 mr-3">📊</span>
                <div>
                  <div className="font-medium text-gray-900">성적 분석</div>
                  <div className="text-sm text-gray-500">학습 성과 및 통계 분석</div>
                </div>
              </button>
              
              <button className="flex items-center p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-red-600 mr-3">🔔</span>
                <div>
                  <div className="font-medium text-gray-900">알림 센터</div>
                  <div className="text-sm text-gray-500">공지사항 및 알림 관리</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessorDashboard;
