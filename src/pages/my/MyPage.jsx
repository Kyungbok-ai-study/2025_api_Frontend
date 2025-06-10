import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api.js';
import ProfileImageUpload from './profile/ProfileImageUpload';
import DepartmentChange from './dept/DepartmentChange';
import VerificationRequest from './verification/VerificationRequest';
import VerificationHistory from './verification/VerificationHistory';
import PasswordChange from './password/PasswordChange';
import EmailChange from './email/EmailChange';

const MyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showProfileImageModal, setShowProfileImageModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token) {
        navigate('/login');
        return;
      }

      if (userData) {
        setUser(JSON.parse(userData));
      }

      // 서버에서 최신 사용자 정보 가져오기
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (window.confirm('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        const password = prompt('탈퇴하려면 비밀번호를 입력해주세요:');
        if (!password) return;

        await apiClient.delete('/auth/deactivate', {
          params: { password }
        });
        
        alert('회원탈퇴가 완료되었습니다.');
        localStorage.clear();
        navigate('/');
      } catch (error) {
        alert(error.response?.data?.detail || '회원탈퇴에 실패했습니다.');
      }
    }
  };

  const handleProfileImageUpdate = async (updatedUser) => {
    if (updatedUser) {
      // 전체 사용자 정보 업데이트
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      // 사용자 정보 다시 로드
      await loadUserData();
    }
  };

  const handleEmailUpdate = async (newEmail) => {
    // 사용자 정보 다시 로드
    await loadUserData();
  };

  // 사용자 역할에 따른 적절한 대시보드로 이동
  const handleBackToDashboard = () => {
    if (user?.role === 'professor') {
      navigate('/professor');
    } else if (user?.role === 'student') {
      navigate('/student');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      // 미인증 사용자
      navigate('/dashboard/unverified');
    }
  };

  // 인증 성공 후 역할 업데이트 및 대시보드 이동
  const handleVerificationSuccess = async () => {
    // 사용자 정보 다시 로드
    await loadUserData();
    
    // 잠시 후 역할에 맞는 대시보드로 이동
    setTimeout(() => {
      handleBackToDashboard();
    }, 2000);
  };

  // 프로필 이미지 URL 생성 (캐시 무효화 포함)
  const getProfileImageUrl = () => {
    if (!user?.profile_image_url) return null;
    const timestamp = new Date().getTime();
    return `http://localhost:8000${user.profile_image_url}?t=${timestamp}`;
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'student':
        return '재학생';
      case 'professor':
        return '교수';
      case 'admin':
        return '관리자';
      case 'unverified':
        return '미인증유저';
      default:
        return '미인증유저';
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      student: 'bg-blue-100 text-blue-800 border-blue-200',
      professor: 'bg-green-100 text-green-800 border-green-200',
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      unverified: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return badges[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-500 mx-auto shadow-lg"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-orange-300 animate-pulse"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={handleBackToDashboard}
                className="flex items-center group transition-all duration-300"
              >
                <img src="/kbulogo.png" alt="경복대학교 로고" className="h-8 w-auto group-hover:scale-105 transition-transform" />
                <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  캠퍼스온
                </h1>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-700 text-sm font-medium">마이페이지</span>
              </div>
              <button
                onClick={handleBackToDashboard}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                대시보드로
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 사이드바 */}
            <div className="lg:w-80">
              <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/50 overflow-hidden">
                {/* 프로필 섹션 */}
                <div className="bg-gradient-to-br from-red-500 via-red-600 to-orange-600 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                  
                  <div className="relative flex flex-col items-center">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-white/30 shadow-lg">
                      {user?.profile_image_url ? (
                        <img 
                          src={getProfileImageUrl()}
                          alt="프로필" 
                          className="w-24 h-24 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div style={{ display: user?.profile_image_url ? 'none' : 'block' }}>
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{user?.name}</h3>
                    <p className="text-white/80 text-sm mb-2">{user?.school}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user?.role)} bg-white/90`}>
                      {getRoleText(user?.role)}
                    </span>
                  </div>
                </div>
                
                {/* 네비게이션 */}
                <nav className="p-2">
                  <div className="space-y-1">
                    {[
                      { id: 'profile', name: '내정보', icon: '👤', desc: '개인정보 관리' },
                      { id: 'account', name: '계정', icon: '⚙️', desc: '계정 설정' },
                      { id: 'service', name: '서비스', icon: '🛡️', desc: '이용 현황' },
                      { id: 'support', name: '이용 안내', icon: '❓', desc: '도움말' },
                      { id: 'etc', name: '기타', icon: '📝', desc: '기타 설정' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 group ${
                          activeTab === tab.id 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105' 
                            : 'text-gray-700 hover:bg-red-50 hover:text-red-700 hover:scale-102'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-xl mr-3 group-hover:scale-110 transition-transform">{tab.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{tab.name}</div>
                            <div className={`text-xs ${activeTab === tab.id ? 'text-white/80' : 'text-gray-500'}`}>
                              {tab.desc}
                            </div>
                          </div>
                          {activeTab === tab.id && (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </nav>
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1">
              <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border border-white/50 overflow-hidden">
                <div className="p-8">
                  {/* 내정보 섹션 */}
                  {activeTab === 'profile' && (
                    <div className="animate-fadeIn">
                      <div className="flex items-center mb-8">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 ml-4">내정보</h2>
                      </div>
                      
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { label: '이름', value: user?.name, icon: '👤' },
                            { label: '아이디', value: user?.user_id, icon: '🆔' },
                            { label: '학교', value: user?.school, icon: '🏫' },
                            { label: '학과', value: user?.department || '미설정', icon: '📚' },
                            { label: '입학년도', value: `${user?.admission_year}년`, icon: '📅' },
                            { label: '역할', value: getRoleText(user?.role), icon: '👥' }
                          ].map((item, index) => (
                            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                              <div className="flex items-center mb-3">
                                <span className="text-xl mr-3">{item.icon}</span>
                                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                  {item.label}
                                </label>
                              </div>
                              <p className="text-lg font-medium text-gray-900">{item.value}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-8">
                          <button 
                            onClick={() => setShowProfileImageModal(true)}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            프로필 사진 변경
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 계정 섹션 */}
                  {activeTab === 'account' && (
                    <div className="animate-fadeIn">
                      <div className="flex items-center mb-8">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 ml-4">계정 관리</h2>
                      </div>
                      
                      <div className="space-y-4">
                        {[
                          { title: '아이디', desc: user?.user_id, action: '변경 불가', actionType: 'disabled', icon: '🆔' },
                          { title: '학과 설정', desc: user?.department || '미설정', action: '변경', actionType: 'department', icon: '📚' },
                          { 
                            title: '학교 인증', 
                            desc: `현재: ${getRoleText(user?.role)}`, 
                            action: user?.role === 'unverified' ? '신청' : '기록 보기', 
                            actionType: 'verification', 
                            icon: '✅' 
                          },
                          { title: '비밀번호 변경', desc: '보안을 위해 정기적으로 변경해주세요', action: '변경', actionType: 'password', icon: '🔒' },
                          { title: '이메일 변경', desc: user?.email || '미설정', action: '변경', actionType: 'email', icon: '📧' }
                        ].map((item, index) => (
                          <div key={index} className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-100 rounded-xl p-6 hover:border-red-200 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="flex justify-between items-center">
                              <div className="flex items-start space-x-4">
                                <span className="text-2xl mt-1">{item.icon}</span>
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                                  <p className="text-gray-600 mt-1">{item.desc}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  if (item.actionType === 'password') setShowPasswordModal(true);
                                  if (item.actionType === 'email') setShowEmailModal(true);
                                  if (item.actionType === 'department') setShowDepartmentModal(true);
                                  if (item.actionType === 'verification') setShowVerificationModal(true);
                                }}
                                disabled={item.actionType === 'disabled'}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                  item.actionType === 'disabled' 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 hover:shadow-md transform hover:-translate-y-0.5'
                                }`}
                              >
                                {item.action}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 서비스 섹션 */}
                  {activeTab === 'service' && (
                    <div className="animate-fadeIn">
                      <div className="flex items-center mb-8">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 ml-4">서비스 이용</h2>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8">
                        <div className="flex items-center mb-4">
                          <div className="bg-green-500 p-2 rounded-full">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h3 className="font-bold text-gray-900 text-xl ml-4">이용 제한 내역</h3>
                        </div>
                        <p className="text-gray-600 mb-6">현재 적용 중인 이용 제한이 없습니다.</p>
                        <div className="bg-white/80 border border-green-300 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                            <p className="text-green-800 font-medium">✅ 정상 이용 중</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 이용 안내 섹션 */}
                  {activeTab === 'support' && (
                    <div className="animate-fadeIn">
                      <div className="flex items-center mb-8">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 ml-4">이용 안내 (도움)</h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { title: '문의하기', desc: '서비스 이용 중 문제가 있으신가요?', icon: '💬', color: 'from-blue-500 to-blue-600' },
                          { title: '공지사항', desc: '최신 소식과 업데이트를 확인하세요', icon: '📢', color: 'from-green-500 to-green-600' },
                          { title: '서비스 이용약관', desc: '캠퍼스온 이용약관을 확인하세요', icon: '📋', color: 'from-orange-500 to-orange-600' },
                          { title: '개인정보 처리방침', desc: '개인정보 처리방침을 확인하세요', icon: '🔒', color: 'from-purple-500 to-purple-600' }
                        ].map((item, index) => (
                          <div key={index} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-red-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-4">
                                <div className={`bg-gradient-to-r ${item.color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                  <span className="text-xl">{item.icon}</span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                                  <p className="text-gray-600">{item.desc}</p>
                                </div>
                              </div>
                              <button className="text-red-600 hover:text-white hover:bg-red-600 px-3 py-1 rounded-lg border border-red-200 hover:border-red-600 transition-all duration-300 font-medium">
                                보기
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 기타 섹션 */}
                  {activeTab === 'etc' && (
                    <div className="animate-fadeIn">
                      <div className="flex items-center mb-8">
                        <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-3 rounded-xl">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 ml-4">기타</h2>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <div className="flex items-start space-x-4">
                              <span className="text-2xl">🔐</span>
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">정보 동의 설정</h3>
                                <p className="text-gray-600 mt-1">개인정보 제공 및 마케팅 동의를 관리하세요</p>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-600 transition-all duration-300 font-medium">
                              설정
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                          <div className="relative flex justify-between items-center">
                            <div className="flex items-start space-x-4">
                              <div className="bg-red-500 p-3 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-bold text-red-900 text-lg">회원탈퇴</h3>
                                <p className="text-red-700 mt-1">탈퇴 시 모든 데이터가 영구적으로 삭제됩니다</p>
                                <p className="text-red-600 text-sm mt-2">이 작업은 되돌릴 수 없으니 신중하게 결정해주세요</p>
                              </div>
                            </div>
                            <button 
                              onClick={handleWithdraw}
                              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-bold"
                            >
                              탈퇴하기
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <PasswordChange
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {/* 이메일 변경 모달 */}
      {showEmailModal && (
        <EmailChange
          user={user}
          onClose={() => setShowEmailModal(false)}
          onEmailUpdate={handleEmailUpdate}
        />
      )}

      {/* 프로필 이미지 업로드 모달 */}
      {showProfileImageModal && (
        <ProfileImageUpload
          user={user}
          onImageUpdate={handleProfileImageUpdate}
          onClose={() => setShowProfileImageModal(false)}
        />
      )}

      {/* 학과 변경 모달 */}
      {showDepartmentModal && (
        <DepartmentChange
          user={user}
          onDepartmentUpdate={handleProfileImageUpdate}
          onClose={() => setShowDepartmentModal(false)}
        />
      )}

      {/* 학교 인증 모달 */}
      {showVerificationModal && (
        user?.role === 'unverified' ? (
          <VerificationRequest
            user={user}
            onVerificationRequest={handleVerificationSuccess}
            onClose={() => setShowVerificationModal(false)}
          />
        ) : (
          <VerificationHistory
            user={user}
            onClose={() => setShowVerificationModal(false)}
          />
        )
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(50px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default MyPage; 