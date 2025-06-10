import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleError, setRoleError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [verificationDetails, setVerificationDetails] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [dbTables, setDbTables] = useState([]);
  const [selectedTableData, setSelectedTableData] = useState(null);
  const [selectedTable, setSelectedTable] = useState('');
  
  // 모달 상태
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState('');
  const [customRejectReason, setCustomRejectReason] = useState('');

  // 거부 사유 옵션
  const rejectReasons = [
    '제출된 서류가 불분명하거나 읽기 어렵습니다.',
    '재학증명서가 3개월 이내 발급본이 아닙니다.',
    '학생증 사진이 불분명하거나 양면이 제출되지 않았습니다.',
    '제출된 서류가 본인 명의가 아닙니다.',
    '필수 서류가 누락되었습니다.',
    '직접 입력'
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('AdminDashboard - 토큰 존재:', !!token);
    console.log('AdminDashboard - 사용자 데이터:', userData);
    
    if (!token) {
      console.log('토큰 없음 - 로그인 페이지로 이동');
      navigate('/login');
      return;
    }

    if (userData) {
      const user = JSON.parse(userData);
      console.log('AdminDashboard - 사용자 정보:', user);
      console.log('AdminDashboard - 사용자 역할:', user.role);
      
      // 관리자 역할이 아닌 경우 접근 차단
      if (user.role !== 'admin') {
        console.log('관리자 권한 없음 - 역할:', user.role);
        setRoleError(true);
        setLoading(false);
        
        // 역할에 따라 적절한 대시보드로 리다이렉트
        setTimeout(() => {
          switch (user.role) {
            case 'student':
              navigate('/student');
              break;
            case 'professor':
              navigate('/professor');
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

  // 탭 변경 시 해당 탭의 데이터 로드
  useEffect(() => {
    if (activeTab === 'verification') {
      loadVerificationRequests();
    } else if (activeTab === 'system') {
      loadDatabaseTables();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      console.log('관리자 대시보드 데이터 로딩');
      
      // 대시보드 통계 로드
      const statsResponse = await apiClient.get('/admin/dashboard/stats');
      console.log('대시보드 통계:', statsResponse.data);
      setDashboardData(statsResponse.data);
      
      // 최근 활동 로드
      const activitiesResponse = await apiClient.get('/admin/dashboard/activities');
      console.log('최근 활동:', activitiesResponse.data);
      setRecentActivities(activitiesResponse.data);
      
    } catch (error) {
      console.error('관리자 대시보드 데이터 로드 실패:', error);
      // 에러 시 기본값 설정
      setDashboardData({
        total_users: 0,
        pending_verifications: 0,
        total_professors: 0,
        total_students: 0,
        total_admins: 0,
        active_users_today: 0,
        new_registrations_this_week: 0,
        new_registrations_this_month: 0
      });
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationRequests = async () => {
    try {
      const response = await apiClient.get('/admin/verifications?status_filter=pending');
      setVerificationDetails(response.data);
    } catch (error) {
      console.error('인증 요청 로드 실패:', error);
      setVerificationDetails([]);
    }
  };

  const loadDatabaseTables = async () => {
    try {
      const response = await apiClient.get('/admin/database/tables');
      setDbTables(response.data);
    } catch (error) {
      console.error('데이터베이스 테이블 로드 실패:', error);
      setDbTables([]);
    }
  };

  const loadTableData = async (tableName, page = 1) => {
    try {
      const response = await apiClient.get(`/admin/database/tables/${tableName}/data?page=${page}&limit=20`);
      setSelectedTableData(response.data);
      setSelectedTable(tableName);
    } catch (error) {
      console.error('테이블 데이터 로드 실패:', error);
      setSelectedTableData(null);
    }
  };

  const handleApproveVerification = async (verificationId) => {
    if (!confirm('정말로 이 인증 요청을 승인하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await apiClient.post('/admin/verifications/action', {
        verification_id: verificationId,
        action: 'approve',
        reason: '관리자가 승인하였습니다.'
      });
      
      alert(`✅ ${response.data.message}`);
      loadVerificationRequests(); // 목록 새로고침
      loadDashboardData(); // 통계 새로고침
      setShowDetailModal(false); // 상세보기 모달 닫기
      
    } catch (error) {
      console.error('인증 승인 실패:', error);
      alert('❌ 인증 승인 중 오류가 발생했습니다.');
    }
  };

  const handleRejectVerification = async () => {
    let finalReason = '';
    
    if (selectedRejectReason === '직접 입력') {
      if (!customRejectReason.trim()) {
        alert('거부 사유를 직접 입력해주세요.');
        return;
      }
      finalReason = customRejectReason.trim();
    } else {
      if (!selectedRejectReason) {
        alert('거부 사유를 선택해주세요.');
        return;
      }
      finalReason = selectedRejectReason;
    }
    
    try {
      const response = await apiClient.post('/admin/verifications/action', {
        verification_id: selectedVerification.id,
        action: 'reject',
        reason: finalReason
      });
      
      alert(`❌ ${response.data.message}`);
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedVerification(null);
      setSelectedRejectReason('');
      setCustomRejectReason('');
      setRejectReason('');
      loadVerificationRequests(); // 목록 새로고침
      loadDashboardData(); // 통계 새로고침
      
    } catch (error) {
      console.error('인증 거부 실패:', error);
      alert('❌ 인증 거부 중 오류가 발생했습니다.');
    }
  };

  const openDetailModal = (verification) => {
    setSelectedVerification(verification);
    setShowDetailModal(true);
  };

  const downloadDocument = (document) => {
    // 실제 파일 다운로드 기능 (현재는 알림만)
    alert(`📁 "${document.name}" 파일 다운로드 기능은 추후 구현될 예정입니다.`);
  };

  const handleDeleteTableRow = async (tableName, rowId) => {
    if (!confirm('정말로 이 데이터를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await apiClient.delete(`/admin/database/tables/${tableName}/rows/${rowId}`);
      alert(response.data.message);
      loadTableData(tableName); // 테이블 데이터 새로고침
      loadDashboardData(); // 통계 새로고침
      
    } catch (error) {
      console.error('데이터 삭제 실패:', error);
      alert(error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('autoLogin');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">관리자 대시보드 로딩 중...</p>
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
            이 페이지는 관리자만 이용할 수 있습니다.
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/kbulogo.png" alt="경복대학교 로고" className="h-8 w-auto" />
              <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                캠퍼스온 관리자
              </h1>
              <span className="ml-4 px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 rounded-full border border-purple-200">
                시스템 관리자
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-medium">시스템 정상</span>
              </div>
              <span className="text-gray-700 font-medium">안녕하세요, {user?.name || user?.user_id}님</span>
              
              <button
                onClick={() => navigate('/my')}
                className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-md hover:shadow-lg"
                title="프로필"
              >
                {user?.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt="프로필" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 네비게이션 메뉴 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', name: '대시보드', icon: '📊' },
              { id: 'users', name: '사용자 관리', icon: '👥' },
              { id: 'verification', name: '인증 관리', icon: '✅' },
              { id: 'deepseek', name: '딥시크 관리', icon: '🤖' },
              { id: 'system', name: '시스템 모니터링', icon: '🖥️' },
              { id: 'settings', name: '설정', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'deepseek') {
                    navigate('/admin/deepseek-management');
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* 대시보드 개요 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 환영 메시지 */}
              <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 overflow-hidden shadow-xl rounded-2xl border border-white/20">
                <div className="px-8 py-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                  <div className="relative">
                    <h2 className="text-3xl font-bold mb-2">
                      👨‍💼 관리자 대시보드에 오신 것을 환영합니다!
                    </h2>
                    <p className="text-purple-100 text-lg">
                      캠퍼스온 플랫폼의 전체 시스템을 관리하고 모니터링하세요.
                    </p>
                  </div>
                </div>
              </div>

              {/* 핵심 지표 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    title: '전체 사용자', 
                    value: dashboardData?.total_users || 0, 
                    unit: '명', 
                    icon: '👥', 
                    color: 'blue',
                    description: '등록된 모든 사용자'
                  },
                  { 
                    title: '인증 대기', 
                    value: dashboardData?.pending_verifications || 0, 
                    unit: '건', 
                    icon: '⏳', 
                    color: 'yellow',
                    description: '승인 대기 중인 인증'
                  },
                  { 
                    title: '오늘 활성 사용자', 
                    value: dashboardData?.active_users_today || 0, 
                    unit: '명', 
                    icon: '🔥', 
                    color: 'green',
                    description: '오늘 로그인한 사용자'
                  },
                  { 
                    title: '이번 주 신규 가입', 
                    value: dashboardData?.new_registrations_this_week || 0, 
                    unit: '명', 
                    icon: '✨', 
                    color: 'purple',
                    description: '최근 7일간 가입자'
                  }
                ].map((stat, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${
                          stat.color === 'blue' ? 'from-blue-400 to-blue-600' :
                          stat.color === 'yellow' ? 'from-yellow-400 to-orange-500' :
                          stat.color === 'green' ? 'from-green-400 to-green-600' :
                          'from-purple-400 to-purple-600'
                        } rounded-xl flex items-center justify-center shadow-lg`}>
                          <span className="text-white text-xl">{stat.icon}</span>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {stat.title}
                            </dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-bold text-gray-900">
                                {stat.value}
                              </div>
                              <div className="ml-1 text-sm text-gray-500">
                                {stat.unit}
                              </div>
                            </dd>
                            <dt className="text-xs text-gray-400 mt-1">
                              {stat.description}
                            </dt>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 역할별 사용자 통계 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  { 
                    title: '학생', 
                    count: dashboardData?.total_students || 0, 
                    icon: '🎓', 
                    color: 'blue' 
                  },
                  { 
                    title: '교수', 
                    count: dashboardData?.total_professors || 0, 
                    icon: '👨‍🏫', 
                    color: 'green' 
                  },
                  { 
                    title: '관리자', 
                    count: dashboardData?.total_admins || 0, 
                    icon: '👨‍💼', 
                    color: 'purple' 
                  }
                ].map((role, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-white/50">
                    <div className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${
                        role.color === 'blue' ? 'from-blue-400 to-blue-600' :
                        role.color === 'green' ? 'from-green-400 to-green-600' :
                        'from-purple-400 to-purple-600'
                      } rounded-2xl mb-4 shadow-lg`}>
                        <span className="text-white text-2xl">{role.icon}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{role.count}명</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 최근 활동 */}
              <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-white/50">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="mr-2">🔔</span>
                    최근 활동
                  </h3>
                </div>
                <div className="p-6">
                  {recentActivities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">최근 활동이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className={`w-3 h-3 rounded-full ${
                            activity.status === 'success' ? 'bg-green-500' :
                            activity.status === 'pending' ? 'bg-yellow-500' :
                            activity.status === 'approved' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.user_name} ({activity.user_id}) - {activity.action}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString('ko-KR')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            activity.status === 'success' ? 'bg-green-100 text-green-800' :
                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            activity.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {activity.status === 'success' ? '성공' :
                             activity.status === 'pending' ? '대기' :
                             activity.status === 'approved' ? '승인' : '실패'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 인증 관리 탭 */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-white/50">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="mr-3">✅</span>
                    인증 요청 관리
                  </h3>
                </div>
                <div className="p-6">
                  {verificationDetails.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-gray-500 text-lg">현재 대기 중인 인증 요청이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {verificationDetails.map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  request.verification_type === 'student' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                }`}>
                                  {request.verification_type === 'student' ? '🎓' : '👨‍🏫'}
                                </div>
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{request.user_name}</h4>
                                  <p className="text-gray-600">{request.email}</p>
                                  <div className="flex items-center space-x-4 mt-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      request.verification_type === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                      {request.verification_type === 'student' ? '학생' : '교수'}
                                    </span>
                                    <span className="text-sm text-gray-500">{request.school}</span>
                                    <span className="text-sm text-gray-500">{request.department}</span>
                                    <span className="text-sm text-gray-500">서류 {request.documents.length}개</span>
                                    <span className="text-sm text-gray-500">
                                      {new Date(request.submitted_at).toLocaleDateString('ko-KR')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={() => openDetailModal(request)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                상세보기
                              </button>
                              <button
                                onClick={() => handleApproveVerification(request.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedVerification(request);
                                  setShowRejectModal(true);
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                              >
                                거부
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 시스템 모니터링 탭 (데이터베이스 관리) */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl border border-white/50">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <span className="mr-3">🖥️</span>
                    데이터베이스 관리
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 테이블 목록 */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4">테이블 목록</h4>
                      <div className="space-y-3">
                        {dbTables.map((table) => (
                          <div key={table.table_name} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="font-medium text-gray-900">{table.table_name}</h5>
                                <p className="text-sm text-gray-500">{table.row_count}개 행</p>
                              </div>
                              <button
                                onClick={() => loadTableData(table.table_name)}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                              >
                                조회
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 테이블 데이터 */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4">
                        테이블 데이터 {selectedTable && `(${selectedTable})`}
                      </h4>
                      {selectedTableData ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  {selectedTableData.columns.map((column) => (
                                    <th key={column} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      {column}
                                    </th>
                                  ))}
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    작업
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {selectedTableData.rows.map((row, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    {selectedTableData.columns.map((column) => (
                                      <td key={column} className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {row[column]?.toString() || '-'}
                                      </td>
                                    ))}
                                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                                      <button
                                        onClick={() => handleDeleteTableRow(selectedTable, row.id)}
                                        className="text-red-600 hover:text-red-900 text-xs"
                                      >
                                        삭제
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="bg-gray-50 px-4 py-3 text-sm text-gray-700">
                            총 {selectedTableData.total_count}개 행
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <p className="text-gray-500">테이블을 선택하여 데이터를 확인하세요.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 기타 탭들은 추후 구현 */}
          {activeTab !== 'overview' && activeTab !== 'verification' && activeTab !== 'system' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">개발 중인 기능입니다</h3>
              <p className="text-gray-600">해당 기능은 곧 추가될 예정입니다.</p>
            </div>
          )}
        </div>
      </main>

      {/* 인증 거부 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">인증 거부 사유</h3>
            <select
              value={selectedRejectReason}
              onChange={(e) => setSelectedRejectReason(e.target.value)}
              className="w-full h-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">거부 사유 선택</option>
              {rejectReasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            {selectedRejectReason === '직접 입력' && (
              <textarea
                value={customRejectReason}
                onChange={(e) => setCustomRejectReason(e.target.value)}
                placeholder="거부 사유를 입력해주세요..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mt-2"
              />
            )}
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedVerification(null);
                  setSelectedRejectReason('');
                  setCustomRejectReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRejectVerification}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                거부
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 인증 요청 상세보기 모달 */}
      {showDetailModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  selectedVerification.verification_type === 'student' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  {selectedVerification.verification_type === 'student' ? '🎓' : '👨‍🏫'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedVerification.user_name}</h3>
                  <p className="text-gray-600">
                    {selectedVerification.verification_type === 'student' ? '재학생' : '교수'} 인증 요청
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 사용자 기본 정보 */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">👤</span>
                    기본 정보
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">이름:</span>
                      <span className="text-gray-900">{selectedVerification.user_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">이메일:</span>
                      <span className="text-gray-900">{selectedVerification.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">전화번호:</span>
                      <span className="text-gray-900">{selectedVerification.phone_number || '미입력'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">학교:</span>
                      <span className="text-gray-900">{selectedVerification.school}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">학과:</span>
                      <span className="text-gray-900">{selectedVerification.department || '미입력'}</span>
                    </div>
                  </div>
                </div>

                {/* 신청 정보 */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    신청 정보
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">신청 유형:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedVerification.verification_type === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedVerification.verification_type === 'student' ? '재학생 인증' : '교수 인증'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">신청일:</span>
                      <span className="text-gray-900">
                        {new Date(selectedVerification.submitted_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">상태:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedVerification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedVerification.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedVerification.status === 'pending' ? '검토 중' :
                         selectedVerification.status === 'approved' ? '승인됨' : '거부됨'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 업로드된 서류 */}
              <div className="space-y-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📁</span>
                    업로드된 서류 ({selectedVerification.documents.length}개)
                  </h4>
                  {selectedVerification.documents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedVerification.documents.map((document, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-200">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                              {document.type === 'application/pdf' ? '📄' : '🖼️'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{document.name}</p>
                              <p className="text-sm text-gray-500">
                                {(document.size / 1024 / 1024).toFixed(2)} MB • {document.type}
                              </p>
                              <p className="text-xs text-gray-400">
                                업로드: {new Date(document.uploaded_at).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => downloadDocument(document)}
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors"
                          >
                            다운로드
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📂</div>
                      <p className="text-gray-500">업로드된 서류가 없습니다.</p>
                    </div>
                  )}
                </div>

                {/* 검토 결과 (있는 경우) */}
                {selectedVerification.reviewed_at && (
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">✅</span>
                      검토 결과
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">검토일:</span>
                        <span className="text-gray-900">
                          {new Date(selectedVerification.reviewed_at).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">검토자:</span>
                        <span className="text-gray-900">{selectedVerification.reviewed_by || '시스템'}</span>
                      </div>
                      {selectedVerification.rejection_reason && (
                        <div>
                          <span className="text-gray-600 font-medium block mb-2">거부 사유:</span>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800">{selectedVerification.rejection_reason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 모달 하단 버튼 */}
            {selectedVerification.status === 'pending' && (
              <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  닫기
                </button>
                <button
                  onClick={() => handleApproveVerification(selectedVerification.id)}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  ✅ 승인
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(true);
                  }}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  ❌ 거부
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
