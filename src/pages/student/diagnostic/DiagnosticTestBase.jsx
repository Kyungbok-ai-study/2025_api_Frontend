import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/api';

const DiagnosticTestBase = ({ 
  departmentConfig,
  userDepartment = null
}) => {
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
      // 실제 구현에서는 API에서 사용자 정보를 가져와야 함
      // 임시: 테스트용 사용자 정보
      const testUser = {
        id: 1,
        name: '홍길동',
        department: userDepartment || departmentConfig.department,
        email: 'test@example.com'
      };
      
      setUser(testUser);
      
      // 실제 구현
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
      // 해당 학과의 진단테스트가 필수인지 확인
      if (departmentConfig.supportedDepartments.includes(user.department)) {
        // 과목 목록에서 해당 학과가 있는지 확인
        const subjectsResponse = await apiClient.get('/diagnosis/subjects');
        const subjects = subjectsResponse.data;
        
        if (subjects.includes(departmentConfig.subject)) {
          setIsRequired(true);
          setCurrentStep('intro');
        } else {
          setError(`${departmentConfig.displayName} 진단테스트가 준비되지 않았습니다.`);
        }
      } else {
        // 지원하지 않는 학과는 메인 대시보드로 이동
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
      
      const response = await apiClient.post('/diagnosis/start', {
        subject: departmentConfig.subject,
        description: `${departmentConfig.displayName} 진단테스트`,
        max_time_minutes: departmentConfig.timeLimit || 60
      });
      
      const data = response.data;

      setTestInfo({
        id: data.id,
        title: `${departmentConfig.displayName} 진단테스트`,
        description: data.description || `${departmentConfig.displayName} 진단테스트`,
        total_questions: data.questions?.length || 30,
        time_limit: data.max_time_minutes || departmentConfig.timeLimit || 60,
        subject: data.subject || departmentConfig.subject
      });
      
      setQuestions(data.questions || []);
      setSubmissionId(data.id);
      setTimeLeft((data.max_time_minutes || departmentConfig.timeLimit || 60) * 60);
      
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
      if (e.key >= '1' && e.key <= '4') {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion && currentQuestion.choices) {
          const keyIndex = parseInt(e.key) - 1;
          if (keyIndex < currentQuestion.choices.length) {
            handleAnswerSelect(currentQuestion.id, e.key);
          }
        }
      }
      else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      }
      else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    
    try {
      const response = await apiClient.post('/diagnosis/submit', {
        test_session_id: submissionId,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          question_id: parseInt(questionId),
          selected_answer: answer,
          is_correct: false // 서버에서 계산
        }))
      });
      
      const result = response.data;
      setTestResult(result);
      setCurrentStep('result');
    } catch (err) {
      console.error('테스트 제출 오류:', err);
      setError('테스트 제출에 실패했습니다.');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">진단테스트 준비 중...</p>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={goToDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 시작 화면
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">{departmentConfig.displayName} 진단테스트</h1>
              <p className="text-xl text-gray-600">{departmentConfig.description}</p>
            </div>

            {/* 테스트 정보 카드 */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">📋 테스트 개요</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium mr-3">1</span>
                      <span className="text-gray-700">총 {departmentConfig.questionCount || 30}문항</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium mr-3">2</span>
                      <span className="text-gray-700">제한시간: {departmentConfig.timeLimit || 60}분</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium mr-3">3</span>
                      <span className="text-gray-700">{departmentConfig.fieldName} 전문 분야</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">🎯 테스트 목적</h3>
                  <ul className="space-y-2 text-gray-700">
                    {departmentConfig.objectives?.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{objective}</span>
                      </li>
                    )) || [
                      <li key="default1" className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>현재 학습 수준 파악</span>
                      </li>,
                      <li key="default2" className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>맞춤형 학습 경로 제공</span>
                      </li>,
                      <li key="default3" className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>부족한 영역 식별</span>
                      </li>
                    ]}
                  </ul>
                </div>
              </div>
            </div>

            {/* 안내사항 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-yellow-800 flex items-center">
                <span className="mr-2">⚠️</span>
                테스트 안내사항
              </h3>
              <ul className="space-y-2 text-yellow-700">
                <li>• 테스트 시작 후에는 중간에 나갈 수 없습니다.</li>
                <li>• 모든 문제를 순서대로 풀어주세요.</li>
                <li>• 시간이 종료되면 자동으로 제출됩니다.</li>
                <li>• 키보드 단축키: 1-4번 키로 답안 선택, 화살표키로 문제 이동</li>
              </ul>
            </div>

            {/* 시작 버튼 */}
            <div className="text-center">
              <button
                onClick={startTest}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                disabled={loading}
              >
                {loading ? '준비 중...' : '진단테스트 시작하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 테스트 진행 화면 - 사진과 같은 레이아웃으로 개선
  if (currentStep === 'testing' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* 상단 헤더 */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-semibold text-gray-800">
                {departmentConfig.displayName} 진단 테스트
              </h1>
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600">
                  응시 시간: <span className="font-mono text-blue-600">{formatTime(timeLeft)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  총 문항: <span className="font-semibold">{questions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* 왼쪽 사이드바 */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3">학습 진행률</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>완료</span>
                    <span className="text-blue-600 font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  <div>총문항: {questions.length}</div>
                  <div>풀이시간: {departmentConfig.timeLimit}분</div>
                  <div>
                    <span className="text-green-600">완료:</span> {answeredCount}문항
                  </div>
                </div>
              </div>

              {/* 문제 번호 그리드 */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3">문제 목록</h3>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => {
                    const isAnswered = answers[question.id] !== undefined;
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`
                          w-10 h-10 rounded text-sm font-medium transition-all
                          ${isCurrent 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : isAnswered 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm">
                {/* 문제 헤더 */}
                <div className="border-b px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      문제 - {currentQuestionIndex + 1}번
                    </h2>
                    <div className="text-sm text-gray-500">
                      {currentQuestionIndex + 1} / {questions.length}
                    </div>
                  </div>
                </div>

                {/* 문제 내용 */}
                <div className="px-6 py-8">
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 leading-relaxed mb-4">
                      {currentQuestion.question}
                    </h3>
                    
                    {/* 문제 이미지가 있는 경우 */}
                    {currentQuestion.image && (
                      <div className="mb-6">
                        <img 
                          src={currentQuestion.image} 
                          alt="문제 이미지" 
                          className="max-w-full h-auto rounded-lg shadow-md"
                        />
                      </div>
                    )}
                  </div>

                  {/* 선택지 */}
                  <div className="space-y-3">
                    {currentQuestion.choices?.map((choice, index) => {
                      const choiceNumber = (index + 1).toString();
                      const isSelected = answers[currentQuestion.id] === choiceNumber;
                      
                      return (
                        <label
                          key={index}
                          className={`
                            block p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex items-start">
                            <div className={`
                              w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-0.5
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-500' 
                                : 'border-gray-300'
                              }
                            `}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name={`question-${currentQuestion.id}`}
                              value={choiceNumber}
                              checked={isSelected}
                              onChange={() => handleAnswerSelect(currentQuestion.id, choiceNumber)}
                              className="hidden"
                            />
                            <div className="flex-1">
                              <span className="text-gray-800">{choice}</span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 하단 버튼 영역 */}
                <div className="border-t px-6 py-4">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      이전 문제
                    </button>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {/* 문제 보기 기능 */}}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        문제 보기
                      </button>
                      
                      <button
                        onClick={() => {/* 임시 저장 기능 */}}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        임시 저장
                      </button>

                      {currentQuestionIndex === questions.length - 1 ? (
                        <button
                          onClick={submitTest}
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? '제출 중...' : '제출 완료'}
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          다음 문제
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (currentStep === 'result' && testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* 결과 헤더 */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold mb-4 text-gray-800">테스트 완료!</h1>
              <p className="text-xl text-gray-600">{departmentConfig.displayName} 진단테스트 결과</p>
            </div>

            {/* 점수 카드 */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {testResult.score || 0}점
              </div>
              <div className="text-lg text-gray-600 mb-4">
                총 {testResult.total_questions || questions.length}문제 중 {testResult.correct_answers || 0}문제 정답
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${(testResult.score || 0)}%` }}
                ></div>
              </div>
              <p className="text-gray-600">
                {testResult.score >= 80 ? '우수한 결과입니다! 🌟' : 
                 testResult.score >= 60 ? '양호한 결과입니다. 👍' : 
                 '더 많은 학습이 필요합니다. 📚'}
              </p>
            </div>

            {/* 상세 분석 */}
            {testResult.detailed_analysis && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">📊 상세 분석</h3>
                <div className="space-y-4">
                  {Object.entries(testResult.detailed_analysis).map(([category, data]) => (
                    <div key={category} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{category}</h4>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          정답률: {data.correct}/{data.total} ({Math.round((data.correct/data.total)*100)}%)
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(data.correct/data.total)*100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 추천 학습 */}
            {testResult.recommendations && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">💡 추천 학습</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {testResult.recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{rec.title}</h4>
                      <p className="text-gray-600 text-sm">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="text-center space-x-4">
              <button
                onClick={goToDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                대시보드로 이동
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DiagnosticTestBase;