import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const Reports = () => {
  const navigate = useNavigate();
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      const response = await apiClient.get('/professor/reports');
      setReportsData(response.data);
    } catch (error) {
      console.error('리포트 데이터 로드 실패:', error);
      alert('리포트 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format) => {
    alert(`${format} 형식으로 리포트를 내보냅니다. (실제 구현 필요)`);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'stable': return '➡️';
      case 'decreasing': return '📉';
      default: return '📊';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">리포트 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!reportsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ 데이터를 불러올 수 없습니다</div>
          <p className="text-gray-600">리포트 데이터를 불러오지 못했습니다.</p>
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
              <h1 className="text-xl font-bold text-gray-900">📋 종합 리포트</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => exportReport('PDF')}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  PDF 내보내기
                </button>
                <button
                  onClick={() => exportReport('Excel')}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Excel 내보내기
                </button>
              </div>
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

      {/* 탭 네비게이션 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              종합 현황
            </button>
            <button
              onClick={() => setSelectedTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              성과 분석
            </button>
            <button
              onClick={() => setSelectedTab('students')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'students'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              학생별 리포트
            </button>
            <button
              onClick={() => setSelectedTab('comparison')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'comparison'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              학과 비교
            </button>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 종합 현황 탭 */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* 리포트 요약 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📊 리포트 요약</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{reportsData.summary.total_students}</div>
                      <div className="text-sm text-gray-500">전체 학생</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{reportsData.summary.total_assignments}</div>
                      <div className="text-sm text-gray-500">전체 과제</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{reportsData.summary.class_avg_score}</div>
                      <div className="text-sm text-gray-500">반 평균 점수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">#{reportsData.summary.department_rank}</div>
                      <div className="text-sm text-gray-500">학과 순위</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-xs text-gray-500">
                    리포트 생성일: {formatDate(reportsData.summary.report_generated_at)}
                  </div>
                </div>
              </div>

              {/* 월별 성과 추이 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📈 월별 성과 추이 (최근 6개월)</h3>
                  <div className="space-y-4">
                    {reportsData.monthly_performance.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 text-sm font-medium text-gray-700">
                            {month.month}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                              <span>활동: {month.activities}건</span>
                              <span>활성 학생: {month.students_active}명</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{month.avg_score}점</div>
                          <div className="text-xs text-gray-500">평균 점수</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 성과 분석 탭 */}
          {selectedTab === 'performance' && (
            <div className="space-y-6">
              {/* 과제별 성과 */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📝 과제별 성과 분석</h3>
                  {reportsData.assignment_performance.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-lg mb-2">📋</div>
                      <p className="text-gray-500">과제 데이터가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reportsData.assignment_performance.map((assignment, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">{assignment.assignment_title}</h4>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {assignment.assignment_type}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">제출률</div>
                              <div className="font-medium">{assignment.completion_rate}%</div>
                            </div>
                            <div>
                              <div className="text-gray-500">평균 점수</div>
                              <div className="font-medium">{assignment.avg_score}점</div>
                            </div>
                            <div>
                              <div className="text-gray-500">최고 점수</div>
                              <div className="font-medium">{assignment.max_score}점</div>
                            </div>
                            <div>
                              <div className="text-gray-500">최저 점수</div>
                              <div className="font-medium">{assignment.min_score}점</div>
                            </div>
                          </div>
                          
                          {/* 완료율 시각화 */}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${assignment.completion_rate}%` }}
                              ></div>
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

          {/* 학생별 리포트 탭 */}
          {selectedTab === 'students' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">👨‍🎓 개별 학생 성과 리포트</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {reportsData.student_reports.map((student) => (
                      <div key={student.student_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                              <p className="text-xs text-gray-500">@{student.user_id}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">#{student.performance_ranking}</span>
                            <span className="text-lg">{getTrendIcon(student.activity_trend)}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">평균 점수</div>
                            <div className="font-medium">{student.avg_score}점</div>
                          </div>
                          <div>
                            <div className="text-gray-500">총 활동</div>
                            <div className="font-medium">{student.total_activities}건</div>
                          </div>
                          <div>
                            <div className="text-gray-500">학습 시간</div>
                            <div className="font-medium">{Math.round(student.total_study_time / 60)}시간</div>
                          </div>
                          <div>
                            <div className="text-gray-500">경고</div>
                            <div className={`font-medium ${student.unresolved_warnings > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {student.unresolved_warnings}건
                            </div>
                          </div>
                        </div>
                        
                        {/* 성과 시각화 */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>성과 수준</span>
                            <span>{student.avg_score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                student.avg_score >= 80 ? 'bg-green-500' :
                                student.avg_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${student.avg_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 학과 비교 탭 */}
          {selectedTab === 'comparison' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🏆 학과별 성과 비교</h3>
                  <div className="space-y-4">
                    {reportsData.department_comparison.map((dept, index) => (
                      <div key={index} className={`p-4 rounded-lg border-2 ${
                        dept.is_current ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              dept.is_current ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className={`text-sm font-medium ${dept.is_current ? 'text-blue-900' : 'text-gray-900'}`}>
                                {dept.department}
                                {dept.is_current && <span className="ml-2 text-xs">(현재 학과)</span>}
                              </h4>
                            </div>
                          </div>
                          <div className="flex space-x-6 text-sm">
                            <div className="text-center">
                              <div className="text-gray-500">평균 점수</div>
                              <div className="font-medium">{dept.avg_score}점</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-500">출석률</div>
                              <div className="font-medium">{dept.attendance}%</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* 성과 비교 시각화 */}
                        <div className="mt-3 space-y-2">
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>평균 점수</span>
                              <span>{dept.avg_score}/100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${dept.is_current ? 'bg-blue-500' : 'bg-gray-400'}`}
                                style={{ width: `${dept.avg_score}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>출석률</span>
                              <span>{dept.attendance}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${dept.is_current ? 'bg-green-500' : 'bg-gray-400'}`}
                                style={{ width: `${dept.attendance}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports; 