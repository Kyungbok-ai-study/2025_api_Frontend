import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api.js';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 토큰 확인
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    // 대시보드 데이터 로드
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      const response = await apiClient.get('/dashboard/overview');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
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
              <span className="text-gray-700">안녕하세요, {user?.name || user?.student_id}님</span>
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
          {/* 환영 메시지 */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎓 학습 대시보드에 오신 것을 환영합니다!
              </h2>
              <p className="text-gray-600">
                개인 맞춤형 학습 관리로 더 효율적인 공부를 시작해보세요.
              </p>
            </div>
          </div>

          {dashboardData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* 현재 학습 수준 */}
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
                          {Math.round((dashboardData?.current_level || 0) * 100)}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* 해결한 문제 수 */}
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
                          {dashboardData?.total_problems_solved || 0}개
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* 연속 학습 일수 */}
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
                          {dashboardData?.current_streak || 0}일
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* 학습 변화량 */}
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
                          {(dashboardData?.level_change || 0) > 0 ? '+' : ''}{Math.round((dashboardData?.level_change || 0) * 100)}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 학습 데이터가 없습니다
                </h3>
                <p className="text-gray-600 mb-4">
                  진단 테스트를 완료하면 개인 맞춤 학습 분석을 제공합니다.
                </p>
                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  진단 테스트 시작하기
                </button>
              </div>
            </div>
          )}

          {/* 빠른 액션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">📚 학습 시작</h3>
                <p className="text-gray-600 mb-4">새로운 문제를 풀어보세요</p>
                <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  문제 풀기
                </button>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">📊 진단 테스트</h3>
                <p className="text-gray-600 mb-4">현재 실력을 확인해보세요</p>
                <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
                  진단 시작
                </button>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">📈 학습 분석</h3>
                <p className="text-gray-600 mb-4">상세한 학습 리포트를 확인하세요</p>
                <button className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors">
                  분석 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 