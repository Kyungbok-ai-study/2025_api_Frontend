import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DiagnosticTest = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('intro'); // 'intro', 'testing', 'result'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20분
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 하드코딩된 문제들
  const questions = [
    {
      id: 1,
      subject: '자료구조',
      content: '다음 중 스택(Stack)의 특징으로 올바른 것은?',
      options: [
        'FIFO(First In First Out) 구조이다',
        'LIFO(Last In First Out) 구조이다',
        '중간 위치의 데이터에 직접 접근이 가능하다',
        '데이터의 크기에 제한이 없다'
      ],
      correct: 1,
      difficulty: '기초'
    },
    {
      id: 2,
      subject: '알고리즘',
      content: '시간 복잡도가 O(n²)인 정렬 알고리즘은?',
      options: [
        '병합 정렬 (Merge Sort)',
        '퀵 정렬 (Quick Sort)',
        '버블 정렬 (Bubble Sort)',
        '힙 정렬 (Heap Sort)'
      ],
      correct: 2,
      difficulty: '기초'
    },
    {
      id: 3,
      subject: '데이터베이스',
      content: 'SQL에서 데이터를 조회할 때 사용하는 명령어는?',
      options: [
        'INSERT',
        'UPDATE',
        'SELECT',
        'DELETE'
      ],
      correct: 2,
      difficulty: '기초'
    },
    {
      id: 4,
      subject: '네트워크',
      content: 'TCP/IP 모델에서 가장 하위 계층은?',
      options: [
        '응용 계층',
        '전송 계층',
        '인터넷 계층',
        '네트워크 접근 계층'
      ],
      correct: 3,
      difficulty: '기초'
    },
    {
      id: 5,
      subject: '프로그래밍',
      content: '다음 중 객체지향 프로그래밍의 특징이 아닌 것은?',
      options: [
        '캡슐화',
        '상속',
        '다형성',
        '절차화'
      ],
      correct: 3,
      difficulty: '중급'
    },
    {
      id: 6,
      subject: '자료구조',
      content: '이진 트리에서 왼쪽 자식 → 루트 → 오른쪽 자식 순서로 방문하는 순회 방법은?',
      options: [
        '전위 순회 (Preorder)',
        '중위 순회 (Inorder)',
        '후위 순회 (Postorder)',
        '레벨 순회 (Level order)'
      ],
      correct: 1,
      difficulty: '중급'
    },
    {
      id: 7,
      subject: '알고리즘',
      content: '다이나믹 프로그래밍의 핵심 원리는?',
      options: [
        '분할 정복',
        '탐욕 선택',
        '최적 부분 구조와 중복 부분 문제',
        '백트래킹'
      ],
      correct: 2,
      difficulty: '중급'
    },
    {
      id: 8,
      subject: '데이터베이스',
      content: '데이터베이스의 ACID 속성에 포함되지 않는 것은?',
      options: [
        '원자성 (Atomicity)',
        '일관성 (Consistency)',
        '격리성 (Isolation)',
        '가용성 (Availability)'
      ],
      correct: 3,
      difficulty: '중급'
    },
    {
      id: 9,
      subject: '네트워크',
      content: 'HTTP와 HTTPS의 주요 차이점은?',
      options: [
        '포트 번호가 다르다',
        'HTTPS는 SSL/TLS 암호화를 사용한다',
        'HTTP는 더 빠르다',
        'HTTPS는 캐싱을 지원하지 않는다'
      ],
      correct: 1,
      difficulty: '중급'
    },
    {
      id: 10,
      subject: '프로그래밍',
      content: 'REST API의 설계 원칙이 아닌 것은?',
      options: [
        '무상태성 (Stateless)',
        '계층화 시스템',
        '캐시 가능성',
        '세션 유지'
      ],
      correct: 3,
      difficulty: '고급'
    }
  ];

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
        const optionIndex = parseInt(e.key) - 1;
        const currentQuestion = questions[currentQuestionIndex];
        if (optionIndex < currentQuestion.options.length) {
          handleAnswerSelect(currentQuestion.id, optionIndex);
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
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // 결과 계산
    const correctAnswers = questions.filter(
      q => answers[q.id] === q.correct
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    // 간단한 로딩 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    setCurrentStep('result');
    setIsSubmitting(false);
  };

  const startTest = () => {
    setCurrentStep('testing');
    setTimeLeft(20 * 60); // 20분 재설정
  };

  const goToDashboard = () => {
    navigate('/student');
  };

  // 시작 화면
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white text-center">
              <div className="text-7xl mb-6">🎯</div>
              <h1 className="text-4xl font-bold mb-4">학습 능력 진단테스트</h1>
              <p className="text-xl text-blue-100">현재 수준을 파악하고 맞춤형 학습 계획을 세워보세요</p>
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
                  <p className="text-gray-600">약 20분</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">문제 수</h3>
                  <p className="text-gray-600">{questions.length}문제</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">평가 분야</h3>
                  <p className="text-gray-600">5개 전공 분야</p>
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
                {currentQuestion.subject}
              </span>
              <span className="inline-block px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm">
                {currentQuestion.difficulty}
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
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`group block p-6 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                      answers[currentQuestion.id] === index
                        ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                        answers[currentQuestion.id] === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-500 group-hover:border-gray-400'
                      }`}>
                        {answers[currentQuestion.id] === index && (
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        )}
                      </div>
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={index}
                        checked={answers[currentQuestion.id] === index}
                        onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                        className="hidden"
                      />
                      <div className={`text-xl font-medium transition-colors ${
                        answers[currentQuestion.id] === index 
                          ? 'text-white' 
                          : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {index + 1}. {option}
                      </div>
                    </div>
                  </label>
                ))}
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
                          : answers[questions[index].id] !== undefined
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

  // 결과 화면
  if (currentStep === 'result') {
    const correctAnswers = questions.filter(q => answers[q.id] === q.correct).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    const level = score >= 80 ? '고급' : score >= 60 ? '중급' : '초급';

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 축하 헤더 */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-12 text-white text-center">
              <div className="text-8xl mb-6">🎉</div>
              <h1 className="text-4xl font-bold mb-4">진단테스트 완료!</h1>
              <p className="text-xl text-green-100">수고하셨습니다. 결과를 확인해보세요.</p>
            </div>

            {/* 결과 내용 */}
            <div className="p-8">
              {/* 주요 결과 */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">{score}점</div>
                  <div className="text-gray-600 text-lg">종합 점수</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 mb-2">{correctAnswers}/{questions.length}</div>
                  <div className="text-gray-600 text-lg">정답 수</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 px-4 py-2 rounded-xl ${
                    level === '고급' ? 'bg-green-100 text-green-700' :
                    level === '중급' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {level} 수준
                  </div>
                  <div className="text-gray-600 text-lg">현재 레벨</div>
                </div>
              </div>

              {/* 과목별 결과 */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 과목별 결과</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {['자료구조', '알고리즘', '데이터베이스', '네트워크', '프로그래밍'].map(subject => {
                    const subjectQuestions = questions.filter(q => q.subject === subject);
                    const subjectCorrect = subjectQuestions.filter(q => answers[q.id] === q.correct).length;
                    const subjectScore = Math.round((subjectCorrect / subjectQuestions.length) * 100);
                    
                    return (
                      <div key={subject} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800">{subject}</span>
                          <span className="text-lg font-bold text-blue-600">{subjectScore}점</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${subjectScore}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {subjectCorrect}/{subjectQuestions.length} 정답
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="text-center space-x-4">
                <button
                  onClick={goToDashboard}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold shadow-lg"
                >
                  🏠 대시보드로 이동
                </button>
                <button
                  onClick={() => {
                    setCurrentStep('intro');
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                    setTimeLeft(20 * 60);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  🔄 다시 응시하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DiagnosticTest; 