import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const ProblemManagement = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [parsedProblems, setParsedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showParsedModal, setShowParsedModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    subject: '',
    file: null
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      setUploadForm(prev => ({
        ...prev,
        subject: user.department || ''
      }));
    }
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      const response = await apiClient.get('/professor/problems');
      setProblems(response.data.problems);
    } catch (error) {
      console.error('문제 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title);
      formData.append('subject', uploadForm.subject);

      // TODO: 팀원이 개발 중인 AI 파싱 API 호출
      // const response = await apiClient.post('/professor/problems/parse-file', formData);
      
      // 임시 모킹 데이터 (실제 API 연동 시 제거)
      setTimeout(() => {
        const mockParsedProblems = [
          {
            id: 'temp_1',
            question: '다음 중 JavaScript의 데이터 타입이 아닌 것은?',
            type: 'multiple_choice',
            choices: ['string', 'number', 'boolean', 'float'],
            correct_answer: 'D',
            explanation: 'JavaScript에는 float 타입이 없습니다. 모든 숫자는 number 타입으로 처리됩니다.',
            difficulty: 2,
            isEditing: false
          },
          {
            id: 'temp_2', 
            question: 'React의 useState 훅의 용도를 설명하시오.',
            type: 'essay',
            choices: null,
            correct_answer: 'useState는 함수형 컴포넌트에서 상태를 관리하기 위한 훅입니다.',
            explanation: 'useState는 상태 변수와 그 변수를 업데이트하는 함수를 반환합니다.',
            difficulty: 3,
            isEditing: false
          }
        ];
        setParsedProblems(mockParsedProblems);
        setShowUploadModal(false);
        setShowParsedModal(true);
        setUploading(false);
      }, 2000);

    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패했습니다.');
      setUploading(false);
    }
  };

  const handleEditProblem = (problemId, field, value) => {
    setParsedProblems(prev => prev.map(problem => 
      problem.id === problemId ? { ...problem, [field]: value } : problem
    ));
  };

  const toggleEditMode = (problemId) => {
    setParsedProblems(prev => prev.map(problem => 
      problem.id === problemId ? { ...problem, isEditing: !problem.isEditing } : problem
    ));
  };

  const handleRegisterProblems = async () => {
    try {
      setParsing(true);
      
      // TODO: 팀원이 개발 중인 AI 등록 API 호출
      // await apiClient.post('/professor/problems/register-batch', { problems: parsedProblems });
      
      // 임시 처리 (실제 API 연동 시 제거)
      setTimeout(() => {
        alert(`${parsedProblems.length}개의 문제가 성공적으로 등록되었습니다.`);
        setShowParsedModal(false);
        setParsedProblems([]);
        loadProblems();
        setParsing(false);
      }, 1500);

    } catch (error) {
      console.error('문제 등록 실패:', error);
      alert('문제 등록에 실패했습니다.');
      setParsing(false);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800', 
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-orange-100 text-orange-800',
      5: 'bg-red-100 text-red-800'
    };
    const labels = {
      1: '매우 쉬움',
      2: '쉬움',
      3: '보통', 
      4: '어려움',
      5: '매우 어려움'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[difficulty]}`}>
        {labels[difficulty]}
      </span>
    );
  };

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
          <p className="mt-4 text-gray-600">문제 목록 로딩 중...</p>
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
              <h1 className="text-xl font-bold text-gray-900">AI 문제 등록</h1>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              📄 문제 파일 업로드
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3">🤖</div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">AI 기반 문제 등록 시스템</h3>
                <p className="text-sm text-blue-700 mt-1">
                  문제 파일을 업로드하면 AI가 자동으로 파싱하여 문제를 생성합니다. 
                  파싱된 내용을 검토하고 수정한 후 등록할 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">등록된 문제</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900">
                  {problems.length}
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">객관식 문제</div>
                <div className="mt-1 text-2xl font-semibold text-blue-600">
                  {problems.filter(p => p.problem_type === 'multiple_choice').length}
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">서술형 문제</div>
                <div className="mt-1 text-2xl font-semibold text-purple-600">
                  {problems.filter(p => p.problem_type === 'essay').length}
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500">AI 학습 완료</div>
                <div className="mt-1 text-2xl font-semibold text-green-600">
                  {problems.reduce((sum, p) => sum + p.usage_count, 0)}
                </div>
              </div>
            </div>
          </div>

          {/* 등록된 문제 목록 */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">등록된 문제 목록</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                AI가 학습한 문제들을 카테고리별로 확인하고 관리하세요.
              </p>
            </div>
            
            {problems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-xl mb-4">📄</div>
                <p className="text-gray-500">등록된 문제가 없습니다.</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  첫 문제 파일 업로드하기
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {problems.map((problem) => (
                  <li key={problem.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">{problem.title}</h4>
                          {getTypeBadge(problem.problem_type)}
                          {getDifficultyBadge(problem.difficulty)}
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            AI 학습 완료
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span>📚 {problem.subject}</span>
                          <span>🎯 활용 횟수: {problem.usage_count}회</span>
                          <span>🤖 AI 점수: 95%</span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          등록일: {problem.created_at}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                          문제 보기
                        </button>
                        <button className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
                          수정
                        </button>
                        <button className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600">
                          AI 재학습
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* 파일 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">문제 파일 업로드</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">문제집 제목</label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="예: 2024년 중간고사 문제"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">과목</label>
                <input
                  type="text"
                  required
                  value={uploadForm.subject}
                  onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder={`과목명 (기본: ${currentUser?.department})`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">문제 파일</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500">
                        <span>파일 선택</span>
                        <input
                          type="file"
                          required
                          className="sr-only"
                          accept=".pdf,.doc,.docx,.txt,.hwp"
                          onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                      </label>
                      <p className="pl-1">또는 드래그 앤 드롭</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, TXT, HWP 파일 지원
                    </p>
                    {selectedFile && (
                      <p className="text-sm text-green-600 mt-2">
                        선택된 파일: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-2">⚠️</div>
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">주의사항</p>
                    <ul className="mt-1 list-disc list-inside">
                      <li>파일 업로드 후 AI가 자동으로 문제를 파싱합니다</li>
                      <li>파싱 결과를 검토하고 수정할 수 있습니다</li>
                      <li>최종 확인 후 AI 학습에 등록됩니다</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {uploading ? '업로드 중...' : '🤖 AI 파싱 시작'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 파싱 결과 모달 */}
      {showParsedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">AI 파싱 결과</h2>
              <button
                onClick={() => setShowParsedModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-green-600 mr-3">✅</div>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    파싱 완료! {parsedProblems.length}개의 문제가 발견되었습니다.
                  </p>
                  <p className="text-sm text-green-700">
                    각 문제를 검토하고 필요시 수정한 후 등록해주세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {parsedProblems.map((problem, index) => (
                <div key={problem.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      문제 {index + 1}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(problem.type)}
                      {getDifficultyBadge(problem.difficulty)}
                      <button
                        onClick={() => toggleEditMode(problem.id)}
                        className={`px-3 py-1 rounded text-sm ${
                          problem.isEditing 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-gray-500 text-white hover:bg-gray-600'
                        }`}
                      >
                        {problem.isEditing ? '저장' : '수정'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">문제</label>
                      {problem.isEditing ? (
                        <textarea
                          value={problem.question}
                          onChange={(e) => handleEditProblem(problem.id, 'question', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                          rows="3"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-md">
                          {problem.question}
                        </p>
                      )}
                    </div>

                    {problem.type === 'multiple_choice' && problem.choices && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">선택지</label>
                        <div className="mt-1 space-y-2">
                          {problem.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600 w-6">
                                {String.fromCharCode(65 + choiceIndex)}.
                              </span>
                              {problem.isEditing ? (
                                <input
                                  value={choice}
                                  onChange={(e) => {
                                    const newChoices = [...problem.choices];
                                    newChoices[choiceIndex] = e.target.value;
                                    handleEditProblem(problem.id, 'choices', newChoices);
                                  }}
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-red-500 focus:border-red-500"
                                />
                              ) : (
                                <span className="flex-1 text-gray-900 bg-gray-50 p-2 rounded">
                                  {choice}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">정답</label>
                      {problem.isEditing ? (
                        <input
                          value={problem.correct_answer}
                          onChange={(e) => handleEditProblem(problem.id, 'correct_answer', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                        />
                      ) : (
                        <p className="mt-1 text-green-600 font-medium bg-green-50 p-2 rounded-md">
                          {problem.correct_answer}
                        </p>
                      )}
                    </div>

                    {problem.explanation && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">해설</label>
                        {problem.isEditing ? (
                          <textarea
                            value={problem.explanation}
                            onChange={(e) => handleEditProblem(problem.id, 'explanation', e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                            rows="2"
                          />
                        ) : (
                          <p className="mt-1 text-gray-700 bg-blue-50 p-3 rounded-md">
                            {problem.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => setShowParsedModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleRegisterProblems}
                disabled={parsing}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {parsing ? 'AI 학습 중...' : `🤖 ${parsedProblems.length}개 문제 AI 등록`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemManagement; 