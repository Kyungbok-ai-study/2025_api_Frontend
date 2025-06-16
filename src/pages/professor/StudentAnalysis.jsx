import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const StudentAnalysis = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, tests, ai, patterns

  useEffect(() => {
    loadStudentAnalysis();
  }, [studentId]);

  const loadStudentAnalysis = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/professor/students/${studentId}/analysis`);
      
      if (response.data.success) {
        setAnalysisData(response.data);
      } else {
        throw new Error('분석 데이터를 불러올 수 없습니다');
      }
    } catch (error) {
      console.error('학생 분석 데이터 로드 실패:', error);
      setError(error.message || '데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConcernLevelColor = (level) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '알 수 없음';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0분';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}분 ${remainingSeconds}초` : `${remainingSeconds}초`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">학생 분석 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">데이터를 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.close()}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            창 닫기
          </button>
        </div>
      </div>
    );
  }

  const { student_info, diagnosis_results, learning_patterns, performance_insights, professor_notes, ai_analyses } = analysisData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.close()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 창 닫기
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {student_info.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{student_info.name} 학생 분석</h1>
                  <p className="text-sm text-gray-600">{student_info.school} • {student_info.department}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* 관심도 뱃지 */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getConcernLevelColor(professor_notes.concern_level)}`}>
                {professor_notes.concern_level === 'high' ? '🔴 관심 필요' : 
                 professor_notes.concern_level === 'medium' ? '🟡 주의 관찰' : '🟢 양호'}
              </div>
              
              {/* 새벽 활동 경고 */}
              {learning_patterns.night_activity_concern && (
                <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  🌙 새벽 활동 주의
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{learning_patterns.total_tests}</div>
                <div className="text-sm text-gray-600">총 진단테스트</div>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <div className="text-indigo-600 text-xl">📊</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(learning_patterns.average_score)}점</div>
                <div className="text-sm text-gray-600">평균 점수</div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="text-green-600 text-xl">🎯</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{Math.round(learning_patterns.best_score)}점</div>
                <div className="text-sm text-gray-600">최고 점수</div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <div className="text-yellow-600 text-xl">🏆</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{learning_patterns.active_days}</div>
                <div className="text-sm text-gray-600">활동 일수</div>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <div className="text-purple-600 text-xl">📅</div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: '📋 개요', icon: '📋' },
                { id: 'tests', name: '📊 진단테스트', icon: '📊' },
                { id: 'ai', name: '🤖 AI 분석', icon: '🤖' },
                { id: 'patterns', name: '📈 학습패턴', icon: '📈' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* 개요 탭 */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 학생 정보 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <span>👤</span>
                      <span>학생 정보</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">이름:</span>
                        <span className="font-medium">{student_info.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">학번:</span>
                        <span className="font-medium">{student_info.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">이메일:</span>
                        <span className="font-medium">{student_info.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">학교:</span>
                        <span className="font-medium">{student_info.school}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">학과:</span>
                        <span className="font-medium">{student_info.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">가입일:</span>
                        <span className="font-medium">{formatDateTime(student_info.created_at).split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* 성과 인사이트 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <span>💡</span>
                      <span>성과 인사이트</span>
                    </h3>
                    
                    {/* 강점 */}
                    <div className="mb-4">
                      <h4 className="font-medium text-green-700 mb-2">✅ 강점</h4>
                      <div className="space-y-1">
                        {performance_insights.strengths.length > 0 ? (
                          performance_insights.strengths.map((strength, index) => (
                            <div key={index} className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded">
                              {strength}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">분석할 데이터가 부족합니다</div>
                        )}
                      </div>
                    </div>

                    {/* 약점 */}
                    <div className="mb-4">
                      <h4 className="font-medium text-red-700 mb-2">⚠️ 개선점</h4>
                      <div className="space-y-1">
                        {performance_insights.weaknesses.map((weakness, index) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                            {weakness}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 추천사항 */}
                    <div>
                      <h4 className="font-medium text-indigo-700 mb-2">💡 추천사항</h4>
                      <div className="space-y-1">
                        {performance_insights.recommendations.map((rec, index) => (
                          <div key={index} className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 진단테스트 탭 */}
            {activeTab === 'tests' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">진단테스트 결과 ({diagnosis_results.length}개)</h3>
                  {learning_patterns.night_tests > 0 && (
                    <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                      🌙 새벽 테스트: {learning_patterns.night_tests}회
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {diagnosis_results.length > 0 ? (
                    diagnosis_results.map((result, index) => {
                      const isNightTest = result.completed_at && 
                        new Date(result.completed_at).getHours() >= 0 && 
                        new Date(result.completed_at).getHours() <= 6;
                      
                      return (
                        <div key={index} className={`bg-gray-50 rounded-lg p-4 border-l-4 ${isNightTest ? 'border-purple-500 bg-purple-50' : 'border-indigo-400'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getScoreBadgeColor(result.score)}`}>
                                {Math.round(result.score)}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 flex items-center space-x-2">
                                  <span>{result.test_type}</span>
                                  {isNightTest && <span className="text-purple-600">🌙</span>}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center space-x-4">
                                  <span>{result.correct_answers}/{result.total_questions} 정답</span>
                                  <span>•</span>
                                  <span>{formatDuration(result.time_taken_seconds)}</span>
                                  <span>•</span>
                                  <span>{result.department}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <div>{formatDateTime(result.completed_at)}</div>
                              <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${getScoreColor(result.score)}`}>
                                {Math.round(result.score)}점
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📊</div>
                      <div className="text-lg font-medium">진단테스트 결과가 없습니다</div>
                      <div className="text-sm mt-2">학생이 진단테스트를 완료하면 여기에 표시됩니다</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI 분석 탭 */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">AI 분석 결과 ({ai_analyses.length}개)</h3>
                
                <div className="space-y-6">
                  {ai_analyses.length > 0 ? (
                    ai_analyses.map((analysis, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🤖</span>
                            <span className="font-semibold">AI 분석 #{analysis.session_id}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            신뢰도: {analysis.confidence_score}%
                          </div>
                        </div>
                        
                        {analysis.analysis && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded">
                                <div className="text-sm text-gray-600">전체 점수</div>
                                <div className="text-lg font-bold">{Math.round(analysis.analysis.overall_score || 0)}점</div>
                              </div>
                              <div className="bg-white p-4 rounded">
                                <div className="text-sm text-gray-600">정답률</div>
                                <div className="text-lg font-bold">
                                  {analysis.analysis.correct_answers || 0}/{analysis.analysis.total_questions || 0}
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded">
                                <div className="text-sm text-gray-600">평균 소요시간</div>
                                <div className="text-lg font-bold">{analysis.analysis.average_time_per_question || 0}초</div>
                              </div>
                            </div>

                            {analysis.analysis.strong_areas && analysis.analysis.strong_areas.length > 0 && (
                              <div>
                                <h4 className="font-medium text-green-700 mb-2">강점 영역</h4>
                                <div className="flex flex-wrap gap-2">
                                  {analysis.analysis.strong_areas.map((area, i) => (
                                    <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {analysis.analysis.weak_areas && analysis.analysis.weak_areas.length > 0 && (
                              <div>
                                <h4 className="font-medium text-red-700 mb-2">취약 영역</h4>
                                <div className="flex flex-wrap gap-2">
                                  {analysis.analysis.weak_areas.map((area, i) => (
                                    <span key={i} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {analysis.analysis.recommendations && analysis.analysis.recommendations.length > 0 && (
                              <div>
                                <h4 className="font-medium text-indigo-700 mb-2">AI 추천사항</h4>
                                <div className="space-y-2">
                                  {analysis.analysis.recommendations.map((rec, i) => (
                                    <div key={i} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded border-l-4 border-indigo-300">
                                      <div className="font-medium">{rec.title || `추천 ${i+1}`}</div>
                                      <div className="text-sm">{rec.description}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 mt-4">
                          분석 생성: {formatDateTime(analysis.created_at)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">🤖</div>
                      <div className="text-lg font-medium">AI 분석 결과가 없습니다</div>
                      <div className="text-sm mt-2">학생이 AI 분석을 요청한 진단테스트가 있으면 여기에 표시됩니다</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 학습패턴 탭 */}
            {activeTab === 'patterns' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">학습 패턴 분석</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 학습 통계 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4 flex items-center space-x-2">
                      <span>📊</span>
                      <span>학습 통계</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 진단테스트:</span>
                        <span className="font-medium">{learning_patterns.total_tests}회</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">평균 점수:</span>
                        <span className="font-medium">{Math.round(learning_patterns.average_score)}점</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">최고 점수:</span>
                        <span className="font-medium">{Math.round(learning_patterns.best_score)}점</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">최근 점수:</span>
                        <span className="font-medium">{Math.round(learning_patterns.latest_score)}점</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">점수 추세:</span>
                        <span className={`font-medium ${learning_patterns.score_trend === 'improving' ? 'text-green-600' : 'text-gray-600'}`}>
                          {learning_patterns.score_trend === 'improving' ? '📈 상승' : '➡️ 안정'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 활동 패턴 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-4 flex items-center space-x-2">
                      <span>⏰</span>
                      <span>활동 패턴</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">활동 일수:</span>
                        <span className="font-medium">{learning_patterns.active_days}일</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 학습시간:</span>
                        <span className="font-medium">{formatDuration(learning_patterns.total_study_time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">평균 테스트 시간:</span>
                        <span className="font-medium">{formatDuration(Math.round(learning_patterns.avg_time_per_test))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">새벽 테스트:</span>
                        <span className={`font-medium ${learning_patterns.night_tests >= 7 ? 'text-purple-600' : 'text-gray-600'}`}>
                          {learning_patterns.night_tests}회 
                          {learning_patterns.night_tests >= 7 && ' 🌙'}
                        </span>
                      </div>
                    </div>
                    
                    {learning_patterns.night_activity_concern && (
                      <div className="mt-4 p-3 bg-purple-100 border border-purple-300 rounded text-sm">
                        <div className="font-medium text-purple-800 mb-1">⚠️ 새벽 활동 주의</div>
                        <div className="text-purple-700">
                          학생이 새벽 시간대(00:00-06:00)에 {learning_patterns.night_tests}회 이상 테스트를 수행했습니다. 
                          적절한 학습 시간 관리가 필요할 수 있습니다.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAnalysis; 