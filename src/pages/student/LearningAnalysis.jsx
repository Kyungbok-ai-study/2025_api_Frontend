import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

/**
 * 🎯 학습분석 페이지 - 진단테스트 이력 관리
 * 1차~10차 진단테스트 결과를 모두 표시하고 분석
 */
const LearningAnalysis = () => {
  const [diagnosticHistory, setDiagnosticHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [progressSummary, setProgressSummary] = useState(null);
  const [hasCompletedDiagnostic, setHasCompletedDiagnostic] = useState(false);

  // 진단테스트 이력 로딩
  useEffect(() => {
    loadDiagnosticHistory();
  }, []);

  const loadDiagnosticHistory = async () => {
    try {
      setLoading(true);
      
      // 🎯 진단테스트 완료 상태 확인
      const statusResponse = await apiClient.get('/auth/diagnostic-test-status');
      const diagnosticCompleted = statusResponse.data.data.diagnostic_test_completed;
      setHasCompletedDiagnostic(diagnosticCompleted);
      
      if (!diagnosticCompleted) {
        console.log('❌ 1차 진단테스트 미완료 - 학습분석 접근 불가');
        setLoading(false);
        return;
      }
      
      // 진단테스트 이력 로딩
      const response = await apiClient.get('/diagnosis/sessions/history');
      
      setDiagnosticHistory(response.data.histories);
      setProgressSummary(response.data.progress_summary);
      
      console.log('✅ 진단테스트 이력 로딩 완료:', response.data);
    } catch (error) {
      console.error('❌ 진단테스트 이력 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 특정 세션 상세 분석 로딩
  const loadSessionAnalysis = async (sessionId) => {
    try {
      const response = await apiClient.get(`/diagnosis/sessions/${sessionId}/analysis`);
      setAnalysisData(response.data);
      setSelectedSession(sessionId);
      
      console.log('✅ 세션 분석 데이터 로딩:', response.data);
    } catch (error) {
      console.error('❌ 세션 분석 로딩 실패:', error);
      alert('분석 데이터를 불러오는데 실패했습니다.');
    }
  };

  // 상태별 색상 및 아이콘
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'text-green-600', bg: 'bg-green-50', icon: '✅', text: '완료' };
      case 'in_progress':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⏳', text: '진행중' };
      case 'abandoned':
        return { color: 'text-gray-600', bg: 'bg-gray-50', icon: '❌', text: '중단' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', icon: '❓', text: '알 수 없음' };
    }
  };

  // 점수별 등급
  const getScoreGrade = (score) => {
    if (score >= 90) return { grade: 'S', color: 'text-purple-600', bg: 'bg-purple-50' };
    if (score >= 80) return { grade: 'A', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 70) return { grade: 'B', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-50' };
  };

  // 시간 포맷팅
  const formatTime = (ms) => {
    if (!ms) return '-';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}분 ${seconds}초`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">학습분석 로딩 중...</h2>
          <p className="text-gray-600">진단테스트 이력을 불러오고 있습니다.</p>
        </div>
      </div>
    );
  }

  // 🎯 진단테스트 미완료 시 안내 화면
  if (!loading && !hasCompletedDiagnostic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-4xl font-bold mb-4 text-gray-800">학습분석 이용 불가</h1>
              <p className="text-xl text-gray-600">1차 진단테스트를 먼저 완료해주세요</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                진단테스트가 필요합니다
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                학습분석 기능을 이용하려면 먼저 <span className="font-bold text-blue-600">1차 진단테스트</span>를 완료해야 합니다.<br/>
                진단테스트를 통해 현재 학습 수준을 파악한 후, 상세한 학습분석을 제공해드립니다.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 진단테스트 완료 후 이용 가능한 기능</h3>
                <ul className="text-left text-blue-800 space-y-2 max-w-md mx-auto">
                  <li>• 📊 진단테스트 이력 및 성장 분석</li>
                  <li>• 🎯 회차별 성과 비교</li>
                  <li>• 🤖 에디의 개인화된 학습 분석</li>
                  <li>• 📈 약점 영역 및 개선 방향 제시</li>
                  <li>• 👥 동료들과의 성과 비교</li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => window.location.href = '/diagnosis'}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg"
                >
                  🚀 1차 진단테스트 시작하기
                </button>
                
                <div className="text-sm text-gray-500">
                  진단테스트 완료 후 자동으로 학습분석을 이용하실 수 있습니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">학습분석</h1>
            <p className="text-xl text-gray-600">진단테스트 이력 및 성장 분석</p>
          </div>

          {/* 진행 상황 요약 */}
          {progressSummary && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">📈 진단테스트 진행 현황</h2>
              
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {progressSummary.total_completed}차
                  </div>
                  <p className="text-gray-600">완료된 진단테스트</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {progressSummary.completion_percentage?.toFixed(0)}%
                  </div>
                  <p className="text-gray-600">전체 진행률</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {progressSummary.latest_score?.toFixed(0) || '-'}점
                  </div>
                  <p className="text-gray-600">최근 점수</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {progressSummary.average_score?.toFixed(0) || '-'}점
                  </div>
                  <p className="text-gray-600">평균 점수</p>
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${progressSummary.completion_percentage}%` }}
                ></div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                {progressSummary.total_completed} / 10차 완료 
                {progressSummary.improvement_trend && (
                  <span className="ml-4">
                    📈 성장 추세: <span className="font-semibold">{progressSummary.improvement_trend}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 진단테스트 이력 목록 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">🎯 진단테스트 이력</h2>
            
            {diagnosticHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  아직 완료된 진단테스트가 없습니다
                </h3>
                <p className="text-gray-500">
                  첫 번째 진단테스트를 시작해보세요!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {diagnosticHistory.map((session) => {
                  const statusDisplay = getStatusDisplay(session.status);
                  const scoreGrade = session.total_score ? getScoreGrade(session.total_score) : null;
                  
                  return (
                    <div 
                      key={session.session_id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => session.status === 'completed' && loadSessionAnalysis(session.session_id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-xl font-bold text-gray-800">
                              {session.round_number}차 진단테스트
                            </h3>
                            
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.bg} ${statusDisplay.color}`}>
                              {statusDisplay.icon} {statusDisplay.text}
                            </span>
                            
                            {scoreGrade && (
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${scoreGrade.bg} ${scoreGrade.color}`}>
                                {scoreGrade.grade}등급
                              </span>
                            )}
                          </div>
                          
                          <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">학과:</span> {session.department}
                            </div>
                            <div>
                              <span className="font-medium">점수:</span> {session.total_score?.toFixed(0) || '-'}점
                            </div>
                            <div>
                              <span className="font-medium">정답률:</span> {session.correct_answers || 0}/{session.total_questions}
                            </div>
                            <div>
                              <span className="font-medium">소요시간:</span> {formatTime(session.total_time_ms)}
                            </div>
                          </div>
                          
                          <div className="mt-3 text-sm text-gray-500">
                            시작: {new Date(session.started_at).toLocaleString('ko-KR')}
                            {session.completed_at && (
                              <span className="ml-4">
                                완료: {new Date(session.completed_at).toLocaleString('ko-KR')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {session.ai_analysis_available && (
                            <div className="text-sm text-blue-600 mb-2">
                              🤖 에디 분석 가능
                            </div>
                          )}
                          
                          {session.status === 'completed' && (
                            <div className="text-sm text-gray-500">
                              클릭하여 상세 분석 보기 →
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 완료율 바 */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              session.completion_rate === 100 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${session.completion_rate}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          진행률: {session.completion_rate}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 상세 분석 모달 */}
          {selectedSession && analysisData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {analysisData.session_info.round_number}차 진단테스트 상세 분석
                    </h2>
                    <button
                      onClick={() => setSelectedSession(null)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* 기본 정보 */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {analysisData.session_info.total_score?.toFixed(0)}점
                      </div>
                      <p className="text-blue-800">총점</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {analysisData.session_info.correct_answers}/{analysisData.session_info.total_questions}
                      </div>
                      <p className="text-green-800">정답/총문제</p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {formatTime(analysisData.session_info.total_time_ms)}
                      </div>
                      <p className="text-purple-800">소요시간</p>
                    </div>
                  </div>
                  
                  {/* AI 분석 결과 */}
                  {analysisData.ai_analysis && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
                      <h3 className="text-xl font-bold mb-4 text-gray-800">🤖 에디의 분석</h3>
                      
                      {/* 유형별 분석 */}
                      {analysisData.ai_analysis.type_analysis && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">📊 유형별 정답률</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {Object.entries(analysisData.ai_analysis.type_analysis).map(([type, score]) => (
                              <div key={type} className="flex justify-between items-center">
                                <span>{type}</span>
                                <span className="font-bold">{score}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 추천사항 */}
                      {analysisData.ai_analysis.recommendations && (
                        <div>
                          <h4 className="font-semibold mb-2">💡 에디의 추천사항</h4>
                          <ul className="space-y-1">
                            {analysisData.ai_analysis.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-gray-700">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 문제별 상세 결과 */}
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">📝 문제별 상세 결과</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {analysisData.detailed_answers.map((answer) => (
                        <div 
                          key={answer.question_id}
                          className={`p-3 rounded-lg border ${
                            answer.is_correct 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              문제 {answer.question_number}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm px-2 py-1 rounded ${
                                answer.is_correct 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {answer.is_correct ? '✅ 정답' : '❌ 오답'}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatTime(answer.time_spent_ms)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600 mt-1">
                            선택: {answer.selected_answer}번 | 정답: {answer.correct_answer}번
                            {answer.domain && <span className="ml-2">| {answer.domain}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningAnalysis; 