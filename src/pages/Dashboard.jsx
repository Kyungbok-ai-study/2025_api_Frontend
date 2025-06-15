import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleError, setRoleError] = useState(false);

  useEffect(() => {
    // 토큰 확인
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Dashboard - 토큰 존재:', !!token);
    console.log('Dashboard - 사용자 데이터:', userData);
    
    if (!token) {
      console.log('토큰 없음 - 로그인 페이지로 이동');
      navigate('/login');
      return;
    }

    if (userData) {
      const user = JSON.parse(userData);
      console.log('Dashboard - 사용자 정보:', user);
      console.log('Dashboard - 사용자 역할:', user.role);
      
      // 인증된 사용자가 미인증 대시보드에 접근하는 경우 차단
      if (user.role === 'student' || user.role === 'professor' || user.role === 'admin') {
        console.log('인증된 사용자 - 역할별 대시보드로 리다이렉트:', user.role);
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
            case 'admin':
              navigate('/admin');
              break;
          }
        }, 3000);
        return;
      }
      
      setUser(user);
    }
    
    setLoading(false);
  }, [navigate]);

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
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">이미 인증된 사용자입니다</h2>
          <p className="mt-2 text-gray-600">
            인증된 사용자는 전용 대시보드를 이용해주세요.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            잠시 후 전용 대시보드로 이동합니다...
          </p>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
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
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">안녕하세요, {user?.name || user?.user_id}님</span>
              
              {/* 프로필 버튼 */}
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

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 미인증 사용자 안내 */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">인증이 필요합니다</h2>
                <p className="mt-2 text-gray-600">
                  캠퍼스온의 모든 기능을 이용하려면 학교 인증이 필요합니다.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate('/my')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    인증 신청하기
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 서비스 소개 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📚</span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">개인 맞춤 학습</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      AI 기반 개인 맞춤형 학습 진도 관리
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🎯</span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">진단 테스트</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      학습 수준 진단 및 분석 서비스
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📊</span>
                    </div>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">학습 분석</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      상세한 학습 통계 및 성과 분석
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 인증 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">인증 절차 안내</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-blue-800">마이페이지에서 '인증 신청하기' 버튼 클릭</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">2</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-blue-800">학생증 또는 재직증명서 업로드</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">3</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-blue-800">관리자 검토 후 승인 완료 (1-2일 소요)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 