import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api.js';

const ProblemGeneration = () => {
  const navigate = useNavigate();
  const [generatedProblems, setGeneratedProblems] = useState([]);
  const [ragContext, setRagContext] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [generationForm, setGenerationForm] = useState({
    subject: '',
    difficulty: 'medium',
    questionType: 'multiple_choice',
    count: 5,
    keywords: '',
    context: ''
  });
  const [realTimeLearning, setRealTimeLearning] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      setGenerationForm(prev => ({
        ...prev,
        subject: user.department || ''
      }));
    }
    loadRagContext();
    if (realTimeLearning) {
      startRealTimeLearning();
    }
  }, []);

  // RAG 컨텍스트 로드
  const loadRagContext = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/professor/rag/context');
      if (response.data.success) {
        setRagContext(response.data.context || []);
      } else {
        console.error('RAG 컨텍스트 로드 실패:', response.data.message);
        setRagContext([]);
      }
    } catch (error) {
      console.error('RAG 컨텍스트 로드 실패:', error);
      setRagContext([]);
    } finally {
      setLoading(false);
    }
  };

  // 실시간 자동 러닝 시작
  const startRealTimeLearning = () => {
    console.log('🤖 실시간 자동 러닝 활성화');
    // 실제 구현에서는 WebSocket 또는 Server-Sent Events 사용
    setInterval(async () => {
      try {
        await apiClient.post('/professor/rag/auto-learning', {
          subject: currentUser?.department,
          timestamp: new Date().toISOString()
        });
        console.log('🔄 자동 러닝 업데이트 완료');
      } catch (error) {
        console.error('자동 러닝 오류:', error);
      }
    }, 300000); // 5분마다 자동 업데이트
  };

  // RAG 기반 문제 생성
  const handleGenerateProblems = async (e) => {
    e.preventDefault();
    setGenerating(true);
    
    try {
      console.log('🧠 RAG 기반 문제 생성 시작:', generationForm);
      
      const response = await apiClient.post('/professor/problems/generate-rag', {
        ...generationForm,
        use_rag: true,
        real_time_learning: realTimeLearning
      });

      if (response.data.success) {
        setGeneratedProblems(response.data.problems);
        setShowGenerationModal(false);
        console.log('✅ 문제 생성 완료:', response.data.problems.length + '개');
      } else {
        console.error('문제 생성 실패:', response.data.message);
        alert('문제 생성에 실패했습니다: ' + response.data.message);
      }
    } catch (error) {
      console.error('문제 생성 실패:', error);
      alert('문제 생성에 실패했습니다: ' + (error.response?.data?.detail || error.message));
    } finally {
      setGenerating(false);
    }
  };

  // 생성된 문제 수정
  const handleEditProblem = (problemId, field, value) => {
    setGeneratedProblems(prev => prev.map(problem => 
      problem.id === problemId ? { ...problem, [field]: value } : problem
    ));
  };

  // 편집 모드 토글
  const toggleEditMode = (problemId) => {
    setGeneratedProblems(prev => prev.map(problem => 
      problem.id === problemId ? { ...problem, isEditing: !problem.isEditing } : problem
    ));
  };

  // 문제 저장 (최종 등록)
  const handleSaveProblems = async () => {
    try {
      const response = await apiClient.post('/professor/problems/save-generated', {
        problems: generatedProblems,
        metadata: {
          generated_by: currentUser?.id,
          generation_method: 'rag',
          real_time_learning: realTimeLearning
        }
      });

      if (response.data.success) {
        alert(`✅ ${generatedProblems.length}개의 문제가 성공적으로 저장되었습니다!`);
        setGeneratedProblems([]);
      }
    } catch (error) {
      console.error('문제 저장 실패:', error);
      alert('문제 저장에 실패했습니다.');
    }
  };

  // 난이도 배지
  const getDifficultyBadge = (difficulty) => {
    const config = {
      'easy': { text: '쉬움', color: 'bg-green-100 text-green-800' },
      'medium': { text: '보통', color: 'bg-blue-100 text-blue-800' },
      'hard': { text: '어려움', color: 'bg-red-100 text-red-800' }
    };
    const curr = config[difficulty] || config['medium'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${curr.color}`}>
        {curr.text}
      </span>
    );
  };

  // 문제 유형 배지
  const getTypeBadge = (type) => {
    const typeConfig = {
      'multiple_choice': { text: '객관식', color: 'bg-blue-100 text-blue-800' },
      'short_answer': { text: '단답형', color: 'bg-green-100 text-green-800' },
      'essay': { text: '서술형', color: 'bg-purple-100 text-purple-800' },
      'true_false': { text: 'O/X', color: 'bg-gray-100 text-gray-800' }
    };
    const config = typeConfig[type] || typeConfig['multiple_choice'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">RAG 시스템 초기화 중...</p>
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
              <h1 className="text-xl font-bold text-gray-900">🧠 RAG 기반 문제 생성</h1>
            </div>
            <div className="flex items-center space-x-4">
            <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">실시간 자동 러닝</span>
                <button
                  onClick={() => setRealTimeLearning(!realTimeLearning)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    realTimeLearning ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                      realTimeLearning ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={() => setShowGenerationModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                🚀 문제 생성
              </button>
            </div>
              </div>
              </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* RAG 컨텍스트 상태 */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            📚 RAG 지식 베이스 상태
            {realTimeLearning && <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">🔄 실시간 업데이트</span>}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ragContext.map((context) => (
              <div key={context.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{context.source}</h3>
                  <span className="text-xs text-gray-500">{context.last_updated}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {context.topics.map((topic, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 생성된 문제 목록 */}
        {generatedProblems.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">🎯 생성된 문제 ({generatedProblems.length}개)</h2>
              <button
                onClick={handleSaveProblems}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                💾 모든 문제 저장
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {generatedProblems.map((problem, index) => (
                <div key={problem.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">문제 {index + 1}</span>
                      {getTypeBadge(problem.type)}
                      {getDifficultyBadge(problem.difficulty)}
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        RAG: {problem.rag_source}
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        신뢰도: {(problem.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                      <button
                        onClick={() => toggleEditMode(problem.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                      {problem.isEditing ? '완료' : '수정'}
                      </button>
                  </div>

                  {/* 문제 내용 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">문제</label>
                      {problem.isEditing ? (
                        <textarea
                          value={problem.question}
                          onChange={(e) => handleEditProblem(problem.id, 'question', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="3"
                        />
                      ) : (
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{problem.question}</p>
                      )}
                    </div>

                  {/* 선택지 (객관식인 경우) */}
                    {problem.type === 'multiple_choice' && problem.choices && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">선택지</label>
                      <div className="space-y-2">
                        {Object.entries(problem.choices).map(([key, value]) => (
                          <div key={key} className="flex items-center">
                            <span className="w-8 text-sm font-medium text-gray-600">{key}.</span>
                              {problem.isEditing ? (
                                <input
                                type="text"
                                value={value}
                                onChange={(e) => handleEditProblem(problem.id, 'choices', {
                                  ...problem.choices,
                                  [key]: e.target.value
                                })}
                                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              ) : (
                              <span className={`flex-1 p-2 rounded ${problem.correct_answer === key ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-700'}`}>
                                {value}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* 정답 */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">정답</label>
                      {problem.isEditing ? (
                      problem.type === 'multiple_choice' ? (
                        <select
                          value={problem.correct_answer}
                          onChange={(e) => handleEditProblem(problem.id, 'correct_answer', e.target.value)}
                          className="w-32 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {Object.keys(problem.choices || {}).map(key => (
                            <option key={key} value={key}>{key}</option>
                          ))}
                        </select>
                      ) : (
                        <textarea
                          value={problem.correct_answer}
                          onChange={(e) => handleEditProblem(problem.id, 'correct_answer', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="2"
                        />
                      )
                      ) : (
                      <p className="text-gray-900 bg-green-50 p-3 rounded-lg">
                        {problem.type === 'multiple_choice' ? `${problem.correct_answer}. ${problem.choices?.[problem.correct_answer] || ''}` : problem.correct_answer}
                        </p>
                      )}
                    </div>

                  {/* 해설 */}
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">해설</label>
                        {problem.isEditing ? (
                          <textarea
                            value={problem.explanation}
                            onChange={(e) => handleEditProblem(problem.id, 'explanation', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                          />
                        ) : (
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{problem.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 문제 생성 모달 */}
      {showGenerationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🧠 RAG 기반 문제 생성</h2>
            <form onSubmit={handleGenerateProblems}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">과목</label>
                  <select
                    value={generationForm.subject}
                    onChange={(e) => setGenerationForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">과목 선택</option>
                    <option value="간호학과">간호학과</option>
                    <option value="물리치료학과">물리치료학과</option>
                    <option value="작업치료학과">작업치료학과</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">문제 유형</label>
                  <select
                    value={generationForm.questionType}
                    onChange={(e) => setGenerationForm(prev => ({ ...prev, questionType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="multiple_choice">객관식</option>
                    <option value="short_answer">단답형</option>
                    <option value="essay">서술형</option>
                    <option value="true_false">O/X</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">난이도</label>
                  <select
                    value={generationForm.difficulty}
                    onChange={(e) => setGenerationForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">쉬움</option>
                    <option value="medium">보통</option>
                    <option value="hard">어려움</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">생성할 문제 수</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={generationForm.count}
                    onChange={(e) => setGenerationForm(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">키워드 (선택)</label>
                  <input
                    type="text"
                    value={generationForm.keywords}
                    onChange={(e) => setGenerationForm(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="예: 간호과정, 환자안전, 약물관리"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">추가 컨텍스트 (선택)</label>
                  <textarea
                    value={generationForm.context}
                    onChange={(e) => setGenerationForm(prev => ({ ...prev, context: e.target.value }))}
                    placeholder="특정 상황이나 조건을 명시해주세요"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
            </div>

              <div className="flex justify-end space-x-3 mt-6">
              <button
                  type="button"
                  onClick={() => setShowGenerationModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                  {generating ? '🧠 생성 중...' : '🚀 생성하기'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemGeneration; 