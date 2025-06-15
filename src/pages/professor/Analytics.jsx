import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const Analytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const response = await apiClient.get('/professor/analytics');
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('학습 분석 데이터 로드 실패:', error);
      alert('학습 분석 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceLevelText = (level) => {
    switch (level) {
      case 'high': return '우수';
      case 'medium': return '보통';
      case 'low': return '미흡';
      default: return '데이터 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">학습 분석 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ 데이터를 불러올 수 없습니다</div>
          <p className="text-gray-600">학습 분석 데이터를 불러오지 못했습니다.</p>
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
              <h1 className="text-xl font-bold text-gray-900">📊 학습 분석</h1>
            </div>
            <div className="flex items-center space-x-4">
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
                  {analyticsData.summary.total_students}명
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">반 평균 점수</div>
                <div className="mt-1 text-2xl font-semibold text-blue-600">
                  {analyticsData.summary.avg_class_score}점
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">우수 학생</div>
                <div className="mt-1 text-2xl font-semibold text-green-600">
                  {analyticsData.summary.high_performers}명
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">위험 학생</div>
                <div className="mt-1 text-2xl font-semibold text-red-600">
                  {analyticsData.summary.at_risk_students}명
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 학생별 성과 분석 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">학생별 성과 분석</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analyticsData.student_performance.map((student) => (
                    <div key={student.student_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">@{student.user_id}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>활동 {student.total_activities}건</span>
                          <span>학습시간 {student.total_study_time}분</span>
                          {student.warning_count > 0 && (
                            <span className="text-red-500">경고 {student.warning_count}건</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{student.avg_score}점</div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPerformanceLevelColor(student.performance_level)}`}>
                            {getPerformanceLevelText(student.performance_level)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 과목별 통계 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">과목별 통계</h3>
                <div className="space-y-4">
                  {analyticsData.subject_stats.map((subject, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{subject.subject}</h4>
                        <span className="text-sm text-gray-500">{subject.students}명</span>
                      </div>
                      
                      <div className="space-y-2">
                        {/* 평균 점수 */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>평균 점수</span>
                            <span>{subject.avg_score}점</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(subject.avg_score / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* 완료율 */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>완료율</span>
                            <span>{subject.completion_rate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${subject.completion_rate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 시간대별 활동 분석 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">시간대별 학습 활동</h3>
                <div className="space-y-2">
                  {Object.entries(analyticsData.hourly_activity).map(([hour, count]) => {
                    const maxCount = Math.max(...Object.values(analyticsData.hourly_activity));
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={hour} className="flex items-center space-x-3">
                        <div className="w-12 text-xs text-gray-500 text-right">
                          {hour.padStart(2, '0')}:00
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-purple-500 h-3 rounded-full transition-all duration-300" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-8 text-xs text-gray-600 text-right">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 성적 분포 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">성적 분포</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.score_distribution).map(([range, count]) => {
                    const total = Object.values(analyticsData.score_distribution).reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    const getColor = (range) => {
                      if (range === '90-100') return 'bg-green-500';
                      if (range === '80-89') return 'bg-blue-500';
                      if (range === '70-79') return 'bg-yellow-500';
                      if (range === '60-69') return 'bg-orange-500';
                      return 'bg-red-500';
                    };
                    
                    return (
                      <div key={range} className="flex items-center space-x-3">
                        <div className="w-16 text-sm text-gray-700 text-right">
                          {range}점
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                              className={`h-4 rounded-full transition-all duration-300 ${getColor(range)}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="w-12 text-sm text-gray-600 text-right">
                          {count}명
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 요일별 학습 패턴 */}
            <div className="bg-white shadow rounded-lg lg:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">요일별 학습 패턴</h3>
                <div className="grid grid-cols-7 gap-4">
                  {Object.entries(analyticsData.weekly_pattern).map(([day, count]) => {
                    const maxCount = Math.max(...Object.values(analyticsData.weekly_pattern));
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={day} className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-2">{day}</div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-lg" style={{ height: '100px' }}>
                            <div 
                              className="bg-indigo-500 rounded-lg transition-all duration-500 flex items-end justify-center"
                              style={{ height: `${percentage}%` }}
                            >
                              <span className="text-xs text-white pb-1">{count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics; 