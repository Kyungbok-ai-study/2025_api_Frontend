import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';

const DiagnosticTest = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState('checking'); // 'checking', 'intro', 'testing', 'result'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 진단테스트 관련 상태
  const [testInfo, setTestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [submissionId, setSubmissionId] = useState(null);
  const [isRequired, setIsRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // 사용자 정보 및 진단테스트 확인
  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      checkDiagnosticRequired();
    }
  }, [user]);

  const getCurrentUser = async () => {
    try {
      // 임시: 테스트용 사용자 정보 (실제로는 API에서 가져와야 함)
      const testUser = {
        id: 1,
        name: '홍길동',
        department: '물리치료학과',
        email: 'test@example.com'
      };
      
      setUser(testUser);
      
      // 실제 구현은 아래와 같이 할 예정
      /*
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiClient.get('/user/profile');
      setUser(response.data);
      */
    } catch (err) {
      console.error('사용자 정보 가져오기 오류:', err);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const checkDiagnosticRequired = async () => {
    if (!user || !user.department) {
      setError('사용자 정보를 확인할 수 없습니다.');
      setLoading(false);
      return;
    }

    try {
      // 물리치료학과만 진단테스트 필수로 설정
      if (user.department === "물리치료학과") {
        // 과목 목록에서 물리치료학과가 있는지 확인
        const subjectsResponse = await apiClient.get('/diagnosis/subjects');
        const subjects = subjectsResponse.data;
        
        if (subjects.includes('physical_therapy')) {
          // 진단테스트가 필요한 경우
          setIsRequired(true);
          setCurrentStep('intro');
        } else {
          setError('물리치료학과 진단테스트가 준비되지 않았습니다.');
        }
      } else {
        // 다른 학과는 진단테스트 선택사항
        setIsRequired(false);
        navigate('/student');
        return;
      }
      
      setLoading(false);
    } catch (err) {
      console.error('진단테스트 확인 오류:', err);
      setError('진단테스트 정보를 가져오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const startDiagnosticTest = async () => {
    if (!user || !user.department) {
      setError('사용자 정보를 확인할 수 없습니다.');
      return;
    }

    try {
      setLoading(true);
      
      // 기존 diagnosis API 사용
      const response = await apiClient.post('/diagnosis/start', {
        subject: 'physical_therapy',
        description: '물리치료학과 진단테스트',
        max_time_minutes: 60
      });
      
      const data = response.data;
      


      // API 응답 구조에 맞게 데이터 설정
      setTestInfo({
        id: data.id,
        title: '물리치료학과 진단테스트',
        description: data.description || '물리치료학과 진단테스트',
        total_questions: data.questions?.length || 30,
        time_limit: data.max_time_minutes || 60,
        subject: data.subject || 'physical_therapy'
      });
      
      setQuestions(data.questions || []);
      setSubmissionId(data.id); // test_session_id
      setTimeLeft((data.max_time_minutes || 60) * 60); // 분을 초로 변환
      
      // 빈 답안으로 시작
      setAnswers({});

      setCurrentStep('testing');
      setLoading(false);
    } catch (err) {
      console.error('진단테스트 시작 오류:', err);
      setError('진단테스트를 시작하는데 실패했습니다.');
      setLoading(false);
    }
  };

  // 타이머 효과
  useEffect(() => {
    let timer;
    if (currentStep === 'testing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, timeLeft]);

  // 키보드 단축키
  useEffect(() => {
    if (currentStep !== 'testing') return;

    const handleKeyPress = (e) => {
      // 숫자 키 1-4로 선택지 선택
      if (e.key >= '1' && e.key <= '4') {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion && currentQuestion.choices) {
          const keyIndex = parseInt(e.key) - 1;
          if (keyIndex < currentQuestion.choices.length) {
            handleAnswerSelect(currentQuestion.id, e.key);
          }
        }
      }
      // 좌우 화살표로 문제 이동
      else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      }
      else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      // Enter로 다음 문제 또는 제출
      else if (e.key === 'Enter') {
        if (currentQuestionIndex === questions.length - 1) {
          submitTest();
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, currentQuestionIndex, questions, answers]);

  const handleTimeUp = () => {
    alert('⏰ 시간이 종료되었습니다. 테스트를 자동 제출합니다.');
    submitTest();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    // 로컬 상태에만 저장 (기존 API는 한 번에 제출하는 방식)
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitTest = async () => {
    if (isSubmitting || !submissionId) return;
    
    setIsSubmitting(true);
    
    try {
      // 답안을 기존 API 형식으로 변환 (답안이 있는 문제만)
      const answersArray = questions
        .filter(question => answers[question.id] && answers[question.id].trim() !== '') // 빈 답안 제외
        .map(question => ({
          question_id: question.id,
          answer: String(answers[question.id]),  // 문자열로 확실히 변환
          time_spent: 60, // 임시 값 (나중에 실제 시간 추적 구현)
          confidence_level: 3 // 임시 값
        }));

      // 최소 1개 이상의 답안이 있는지 확인
      if (answersArray.length === 0) {
        setError('최소 1개 이상의 문제에 답변해야 합니다.');
        return;
      }

      // 진단테스트 제출
      const response = await apiClient.post('/diagnosis/submit', {
        test_session_id: submissionId,
        answers: answersArray,
        total_time_spent: (testInfo?.time_limit || 60) * 60 - timeLeft
      });
      
      const result = response.data;
      
      // 결과 화면 대신 학습 분석 페이지로 이동
      navigate('/student/analysis', {
        state: {
          testResult: result,
          testSessionId: submissionId
        }
      });
    } catch (err) {
      console.error('테스트 제출 오류:', err);
      setError('테스트 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startTest = () => {
    startDiagnosticTest();
  };

  const goToDashboard = () => {
    navigate('/student');
  };

  // 로딩 화면
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">진단테스트 확인 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              다시 시도
            </button>
            <button
              onClick={goToDashboard}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400"
            >
              대시보드로
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 시작 화면
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white text-center">
              <div className="text-7xl mb-6">🏥</div>
              <h1 className="text-4xl font-bold mb-4">물리치료학과 진단테스트</h1>
              <p className="text-xl text-blue-100">현재 수준을 파악하고 맞춤형 학습 계획을 세워보세요</p>
              <p className="text-lg text-blue-200 mt-2">
                {user?.department} 학생을 위한 전문 진단테스트
              </p>
            </div>

            {/* 내용 */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* 테스트 정보 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">소요 시간</h3>
                  <p className="text-gray-600">{testInfo ? `${testInfo.time_limit}분` : '60분'}</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">문제 수</h3>
                  <p className="text-gray-600">{testInfo ? `${testInfo.total_questions}문제` : '30문제'}</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">평가 분야</h3>
                  <p className="text-gray-600">물리치료 전문 분야</p>
                </div>
              </div>

              {/* 주의사항 */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-amber-800 mb-4">📌 주의사항</h3>
                <ul className="space-y-2 text-amber-700">
                  <li>• 시간 제한이 있으므로 신중하게 답변해주세요</li>
                  <li>• 브라우저 새로고침 시 진행 상황이 초기화됩니다</li>
                  <li>• 모든 문제를 풀지 않아도 제출 가능합니다</li>
                  <li>• 제출 후에는 수정할 수 없습니다</li>
                </ul>
              </div>

              {/* 버튼 영역 */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={goToDashboard}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  ← 대시보드로 돌아가기
                </button>
                <button
                  onClick={startTest}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  🚀 테스트 시작하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 테스트 진행 화면
  if (currentStep === 'testing') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const isTimeWarning = timeLeft < 300; // 5분 미만



    // currentQuestion이 없으면 로딩 표시
    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">문제 로딩 중...</h2>
            <p className="text-gray-600">잠시만 기다려주세요.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black">
        {/* 최소한의 상단 헤더 */}
        <div className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* 진행 상황 */}
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">문제</span>
                <span className="text-white text-lg font-bold">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
              </div>

              {/* 타이머 */}
              <div className={`px-4 py-2 rounded-lg font-mono text-xl font-bold ${
                isTimeWarning 
                  ? 'bg-red-900 text-red-300 animate-pulse' 
                  : 'bg-gray-800 text-gray-300'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            
            {/* 진행률 바 */}
            <div className="mt-3">
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 중앙 집중 문제 영역 */}
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
          <div className="w-full max-w-4xl">
            {/* 과목 정보 */}
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-2 bg-blue-900 text-blue-300 rounded-full text-sm font-medium mr-3">
                {testInfo?.subject === 'physical_therapy' ? '물리치료' : '물리치료'}
              </span>
              <span className="inline-block px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm">
                {currentQuestion.difficulty === '1' ? '쉬움' : 
                 currentQuestion.difficulty === '2' ? '보통' : 
                 ['4', '5'].includes(currentQuestion.difficulty) ? '어려움' : '보통'}
              </span>
            </div>

            {/* 문제 내용 */}
            <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white leading-relaxed">
                  {currentQuestion.content}
                </h2>
              </div>

              {/* 선택지 */}
              <div className="space-y-4 mb-10">
                {(currentQuestion.choices || []).map((choice, index) => {
                  // "1. 선택지내용" 형태를 분리
                  const choiceNumber = (index + 1).toString();
                  const choiceText = choice.replace(/^\d+\.\s*/, ''); // 앞의 "1. " 제거
                  
                  return (
                    <label
                      key={index}
                      className={`group block p-6 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                        answers[currentQuestion.id] === choiceNumber
                          ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                          answers[currentQuestion.id] === choiceNumber
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-500 group-hover:border-gray-400'
                        }`}>
                          {answers[currentQuestion.id] === choiceNumber && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={choiceNumber}
                          checked={answers[currentQuestion.id] === choiceNumber}
                          onChange={() => handleAnswerSelect(currentQuestion.id, choiceNumber)}
                          className="hidden"
                        />
                        <div className={`text-xl font-medium transition-colors ${
                          answers[currentQuestion.id] === choiceNumber 
                            ? 'text-white' 
                            : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {choiceNumber}. {choiceText}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* 하단 네비게이션 */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-700">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <span className="mr-2">←</span>
                  이전
                </button>

                {/* 중앙 진행 표시 */}
                <div className="flex space-x-2">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-blue-500 scale-125'
                          : answers[questions[index]?.id] !== undefined
                          ? 'bg-green-500'
                          : 'bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>

                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={submitTest}
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 transition-all duration-200 font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        제출 중...
                      </>
                    ) : (
                      <>
                        완료
                        <span className="ml-2">✓</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all duration-200 font-semibold"
                  >
                    다음
                    <span className="ml-2">→</span>
                  </button>
                )}
              </div>
            </div>

                         {/* 키보드 단축키 안내 */}
             <div className="text-center mt-6">
               <p className="text-gray-500 text-sm">
                 💡 <span className="text-gray-400">단축키:</span> 
                 <span className="text-blue-400 font-mono mx-2">1-4</span>선택 
                 <span className="text-blue-400 font-mono mx-2">← →</span>이동 
                 <span className="text-blue-400 font-mono mx-2">Enter</span>다음
               </p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // 테스트 완료 후 바로 학습 분석 페이지로 이동하므로 
  // 별도의 결과 화면이 필요 없음

  return null;
};

export default DiagnosticTest; 