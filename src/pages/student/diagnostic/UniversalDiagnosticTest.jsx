import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../../services/api';

/**
 * 범용 진단테스트 컴포넌트
 * 모든 학과에서 사용 가능한 통합 진단테스트 시스템
 */
const UniversalDiagnosticTest = ({ userDepartment, testConfig }) => {
  // 상태 관리
  const [currentStep, setCurrentStep] = useState('intro'); // intro, test, grading, result
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [roundNumber, setRoundNumber] = useState(1); // 🎯 진단테스트 회차
  const [testStartTime, setTestStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questionTimes, setQuestionTimes] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60분 기본값

  // 학과별 설정 기본값
  const defaultConfig = {
    departmentName: userDepartment || '정보 없음',
    testType: 'general_1st',
    totalQuestions: 30,
    timeLimit: 60, // 분
    questionFile: 'general_questions.json',
    emoji: '📚',
    title: '1차 진단테스트',
    description: '전공 기출문제 기반 학생 수준 진단'
  };

  const config = { ...defaultConfig, ...testConfig };

  // 시간 포맷팅 함수들
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimeMs = (milliseconds) => {
    const seconds = Math.round(milliseconds / 1000);
    return `${seconds}초`;
  };

  // 테스트 데이터 로딩 (백엔드 API 사용)
  const loadTestData = async () => {
    try {
      console.log(`📚 ${config.departmentName} 진단테스트 데이터 로딩 중...`);
      
      // 🔧 백엔드 API에서 학과별 문제 데이터 로딩
      const response = await apiClient.get(`/diagnosis/questions/${userDepartment}`);
      
      if (response.data && response.data.questions && Array.isArray(response.data.questions)) {
        const questions = response.data.questions;
        const selectedQuestions = questions.slice(0, config.totalQuestions);
        setQuestions(selectedQuestions);
        console.log(`✅ 문제 ${selectedQuestions.length}개 로딩 완료 (${response.data.department_display})`);
        
        // 진단테스트 세션 시작
        await startSession();
        
        // 🔧 테스트 화면으로 전환
        setCurrentStep('test');
        console.log('🚀 테스트 화면으로 전환 완료');
      } else {
        throw new Error('문제 데이터가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error(`❌ ${config.departmentName} 테스트 데이터 로딩 실패:`, error);
      
      // 사용자 친화적 오류 메시지
      let errorMessage = '테스트 데이터 로딩에 실패했습니다.';
      if (error.response?.status === 404) {
        errorMessage = `${config.departmentName} 문제 데이터를 찾을 수 없습니다.`;
      } else if (error.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      alert(`${errorMessage}\n\n오류 상세: ${error.message}`);
    }
  };

  // 세션 시작
  const startSession = async () => {
    try {
      const response = await apiClient.post('/diagnosis/sessions/start', {
        test_type: config.testType,
        department: config.departmentName,
        total_questions: config.totalQuestions,
        time_limit_minutes: config.timeLimit
      });
      
      setSessionId(response.data.session_id);
      setRoundNumber(response.data.round_number); // 🎯 회차 정보 저장
      setTestStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setTimeLeft(config.timeLimit * 60);
      
      console.log(`✅ ${response.data.round_number}차 진단테스트 세션 시작:`, response.data);
    } catch (error) {
      console.error('❌ 세션 시작 실패:', error);
      alert('세션 시작에 실패했습니다: ' + error.message);
    }
  };

  // 타이머 관리
  useEffect(() => {
    if (currentStep === 'test' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest(); // 시간 종료 시 자동 제출
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep, timeLeft]);

  // 키보드 단축키 핸들러
  const handleKeyPress = useCallback((event) => {
    if (currentStep !== 'test' || submitting) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    // 화살표 키로 문제 이동
    if (event.key === 'ArrowLeft' && currentQuestionIndex > 0) {
      event.preventDefault();
      handlePrevQuestion();
    } else if (event.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
      event.preventDefault();
      handleNextQuestion();
    }
    
    // 숫자 키로 선택지 선택 (1-5)
    else if (['1', '2', '3', '4', '5'].includes(event.key)) {
      event.preventDefault();
      const answerNumber = event.key;
      handleAnswerSelect(currentQuestion.question_id, answerNumber);
      console.log(`⌨️ 키보드로 선택: ${answerNumber}번`);
    }
    
    // Enter 키로 제출 (마지막 문제일 때)
    else if (event.key === 'Enter' && currentQuestionIndex === questions.length - 1) {
      event.preventDefault();
      handleSubmitTest();
    }
  }, [currentStep, submitting, currentQuestionIndex, questions]);

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // 답변 선택 (정답 표시 없이 순수 선택만)
  const handleAnswerSelect = (questionId, answer) => {
    const currentQuestion = questions.find(q => q.question_id === questionId);
    
    if (questionStartTime) {
      const timeSpent = Date.now() - questionStartTime;
      setQuestionTimes(prev => ({
        ...prev,
        [questionId]: timeSpent
      }));
      
      console.log(`⏱️ 문제 ${currentQuestion.question_number} 풀이 시간: ${formatTimeMs(timeSpent)}`);
    }
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // 🚨 정답 정보는 로그에서도 제거 (테스트 신뢰성 보장)
    console.log(`📝 문제 ${currentQuestion.question_number} 답변 선택: ${answer}번 (${formatTimeMs(Date.now() - questionStartTime)})`);
  };

  // 다음/이전 문제
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  // 테스트 제출
  const handleSubmitTest = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    setCurrentStep('grading');
    console.log('📊 테스트 제출 및 채점 시작...');
    
    try {
      // 마지막 문제 시간 기록
      if (questionStartTime && questions.length > 0) {
        const lastQuestion = questions[currentQuestionIndex];
        const timeSpent = Date.now() - questionStartTime;
        setQuestionTimes(prev => ({
          ...prev,
          [lastQuestion.question_id]: timeSpent
        }));
      }
      
      // 채점 및 분석 단계별 진행
      await new Promise(resolve => setTimeout(resolve, 2000)); // 채점 시작
      
      // 점수 계산 및 유형별 분석
      let correctAnswers = 0;
      const detailedResults = [];
      const typeStats = {};
      
      questions.forEach(question => {
        const isCorrect = answers[question.question_id] === question.correct_answer;
        if (isCorrect) correctAnswers++;
        
        // 유형별 통계 집계
        const type = question.question_type || '기타';
        if (!typeStats[type]) {
          typeStats[type] = { total: 0, correct: 0, questions: [] };
        }
        typeStats[type].total++;
        if (isCorrect) typeStats[type].correct++;
        typeStats[type].questions.push({
          number: question.question_number,
          isCorrect,
          domain: question.domain
        });
        
        detailedResults.push({
          question_id: question.question_id,
          question_number: question.question_number,
          selected_answer: answers[question.question_id] || null,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          time_spent_ms: questionTimes[question.question_id] || 0,
          difficulty_level: question.difficulty_level,
          domain: question.domain,
          question_type: question.question_type
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // 통계 분석
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      const totalTimeUsed = Date.now() - testStartTime;
      
      // 백엔드에 최종 결과 제출
      const submitResponse = await apiClient.post('/diagnosis/sessions/complete', {
        session_id: sessionId,
        total_score: score,
        correct_answers: correctAnswers,
        wrong_answers: questions.length - correctAnswers,
        total_time_ms: totalTimeUsed,
        detailed_results: detailedResults,
        request_edi_analysis: true
      });
      
              await new Promise(resolve => setTimeout(resolve, 3000)); // 에디 분석
      
              console.log('✅ 테스트 완료 및 에디 분석 요청:', submitResponse.data);
      
      // 결과 설정
      const result = {
        totalQuestions: questions.length,
        correctAnswers,
        wrongAnswers: questions.length - correctAnswers,
        score,
        level: score >= 80 ? '상급' : score >= 65 ? '중급' : score >= 50 ? '하급' : '미흡',
        timeUsed: totalTimeUsed,
        questionTimes: questionTimes,
        detailedResults: detailedResults,
        typeStats: typeStats,
        ediAnalysis: submitResponse.data.ai_analysis,
        sessionId: sessionId
      };
      
      console.log('📊 최종 테스트 결과 (유형별 통계 포함):', result);
      
      // 🎯 1차 진단테스트 완료 시 사용자 상태 새로고침
      if (roundNumber === 1) {
        try {
          // 잠시 대기 후 사용자 정보 새로고침 (데이터베이스 커밋 대기)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 진단테스트 완료 상태 확인
          const statusResponse = await apiClient.get('/auth/diagnostic-test-status');
          console.log('🔍 진단테스트 상태 확인:', statusResponse.data);
          
          // 사용자 정보 새로고침
          const userResponse = await apiClient.get('/auth/me');
          console.log('👤 새로고침된 사용자 정보:', userResponse.data);
          
          // 로컬 스토리지 업데이트
          if (userResponse.data.diagnostic_test_completed) {
            const updatedUser = { ...JSON.parse(localStorage.getItem('user')), diagnostic_test_completed: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('✅ 1차 진단테스트 완료 - 사용자 상태 업데이트됨');
          } else {
            console.warn('⚠️ 사용자 상태가 아직 업데이트되지 않음');
          }
        } catch (error) {
          console.warn('⚠️ 사용자 상태 새로고침 실패:', error);
        }
      }
      
      setTestResult(result);
      setCurrentStep('result');
      
    } catch (error) {
      console.error('❌ 테스트 제출 실패:', error);
      alert('테스트 제출에 실패했습니다: ' + error.message);
      setCurrentStep('test');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. 시작 화면
  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{config.emoji}</div>
              <h1 className="text-4xl font-bold mb-4 text-gray-800">
                {config.departmentName} {roundNumber}차 진단테스트
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                {config.description}
              </p>
              <p className="text-sm text-gray-500">
                사용자 학과: {userDepartment || '정보 없음'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <div className="text-green-600 text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-green-800 mb-2">
                  범용 진단테스트 시스템!
                </h2>
                <p className="text-green-700 text-lg">
                  모든 학과 대응 AI 기반 개인화 진단테스트가 준비되었습니다!
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">📝</div>
                  <h3 className="font-semibold mb-2">문제 수</h3>
                  <p className="text-gray-600">{config.totalQuestions}문제</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">⏰</div>
                  <h3 className="font-semibold mb-2">제한 시간</h3>
                  <p className="text-gray-600">{config.timeLimit}분</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="text-3xl mb-3">🤖</div>
                  <h3 className="font-semibold mb-2">에디 분석</h3>
                  <p className="text-gray-600">문제별 해설</p>
                </div>
              </div>

              {/* 키보드 단축키 안내 */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4 text-gray-800">⌨️ 키보드 단축키</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>문제 이동:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">← →</span>
                  </div>
                  <div className="flex justify-between">
                    <span>답안 선택:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">1 2 3 4 5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>테스트 제출:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">Enter</span>
                  </div>
                  <div className="flex justify-between">
                    <span>시간 단축:</span>
                    <span className="text-blue-600">키보드 사용 권장</span>
                  </div>
                </div>
              </div>

              <button
                onClick={loadTestData}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-lg transition-colors text-lg"
              >
                🚀 진단테스트 시작
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 테스트 진행 화면
  if (currentStep === 'test' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-6">
          {/* 상단 진행률 바 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {config.departmentName} {roundNumber}차 진단테스트
              </h2>
              <div className="text-lg font-mono text-red-600">
                ⏰ {formatTime(timeLeft)}
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>문제 {currentQuestionIndex + 1} / {questions.length}</span>
              <span>{Math.round(progress)}% 완료</span>
            </div>
          </div>

          {/* 문제 카드 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  문제 {currentQuestion.question_number}
                </h3>
                <div className="text-sm text-gray-500">
                  {currentQuestion.domain} | {currentQuestion.question_type}
                </div>
              </div>
              
              <div className="text-gray-800 text-lg leading-relaxed mb-6">
                {currentQuestion.question_text}
              </div>
            </div>

            {/* 선택지 (정답 표시 없이 순수 선택만) */}
            <div className="space-y-3">
              {currentQuestion.choices && currentQuestion.choices.map((choice, index) => {
                const choiceNumber = (index + 1).toString();
                const isSelected = answers[currentQuestion.question_id] === choiceNumber;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion.question_id, choiceNumber)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 text-blue-900' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`inline-block w-8 h-8 rounded-full text-center leading-8 mr-4 text-sm font-semibold ${
                      isSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {choiceNumber}
                    </span>
                    {choice}
                  </button>
                );
              })}
            </div>
            
            {/* 🚨 진단테스트 중에는 정답/오답 표시 완전 제거 */}
            {/* 선택한 답안만 표시하고, 정답 여부는 테스트 완료 후에만 공개 */}
          </div>

          {/* 네비게이션 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← 이전
              </button>

              <div className="flex space-x-4 text-sm text-gray-500">
                <span>답변됨: {Object.keys(answers).length} / {questions.length}</span>
                <span>진행률: {Math.round((Object.keys(answers).length / questions.length) * 100)}%</span>
              </div>

              <div className="flex space-x-3">
                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleSubmitTest}
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {submitting ? '📝 채점 진행 중...' : '✅ 테스트 완료'}
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    다음 →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. 채점/분석 과정 화면
  if (currentStep === 'grading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8">
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="animate-pulse mb-8">
              <div className="text-8xl mb-6">🤖</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                에디가 채점하고 있어요
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                잠시만 기다려주세요. 곧 분석 결과를 보여드릴게요!
              </p>
            </div>
            
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-gray-700">답안 수집 완료</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">정답 채점 중...</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <span className="text-gray-500">유형별 분석 준비 중</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                <span className="text-gray-500">에디 분석 결과 생성</span>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" 
                     style={{width: '60%'}}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">분석 진행 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 결과 화면은 별도 컴포넌트로 분리 (너무 길어서)
  if (currentStep === 'result' && testResult) {
    return <TestResultComponent 
      testResult={testResult} 
      config={config} 
      formatTimeMs={formatTimeMs}
      questions={questions}  // 🔧 questions 데이터 전달
      onRestart={() => {
        setCurrentStep('intro');
        setAnswers({});
        setCurrentQuestionIndex(0);
        setTestResult(null);
        setSessionId(null);
        setQuestionTimes({});
      }}
    />;
  }

  // 로딩 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">AI 진단테스트 준비 중...</p>
        {sessionId && (
          <p className="text-sm text-gray-500 mt-2">세션 ID: {sessionId}</p>
        )}
      </div>
    </div>
  );
};

// 결과 컴포넌트 (상세 분석 포함)
const TestResultComponent = ({ testResult, config, formatTimeMs, questions, onRestart }) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // 물리치료학과 전용 영역 매핑
  const physicalTherapyDomains = {
    '근골격계': { icon: '🦴', color: 'blue' },
    '신경계물리치료': { icon: '🧠', color: 'purple' },
    '심폐물리치료': { icon: '❤️', color: 'red' },
    '소아물리치료': { icon: '👶', color: 'pink' },
    '정형외과물리치료': { icon: '🏥', color: 'green' },
    '운동생리학': { icon: '💪', color: 'orange' },
    '물리치료학': { icon: '⚡', color: 'yellow' },
    '평가학': { icon: '📊', color: 'indigo' },
    '도수치료': { icon: '👐', color: 'teal' },
    '해부학': { icon: '🔬', color: 'gray' },
    '운동치료학': { icon: '🏃', color: 'emerald' },
    '직업윤리': { icon: '⚖️', color: 'slate' }
  };

  // 영역별 통계 계산
  const domainStats = {};
  testResult.detailedResults.forEach(result => {
    const domain = result.domain || '기타';
    if (!domainStats[domain]) {
      domainStats[domain] = { total: 0, correct: 0, questions: [] };
    }
    domainStats[domain].total++;
    if (result.is_correct) domainStats[domain].correct++;
    domainStats[domain].questions.push(result);
  });

  // AI 해설 생성 (모든 선택지 분석 포함)
  const generateAIExplanation = async (question) => {
    setLoadingExplanation(true);
    try {
      // 실제 에디 해설 생성 (엑사원 API 호출)
      await new Promise(resolve => setTimeout(resolve, 3000)); // 시뮬레이션
      
             // 해당 문제의 원본 데이터에서 선택지 가져오기
       const originalQuestion = questions?.find(q => q.question_id === question.question_id);
       const choices = originalQuestion?.choices || [];
      
      // 선택지별 상세 해설 생성
      const choiceExplanations = choices.map((choice, index) => {
        const choiceNum = (index + 1).toString();
        const isCorrect = choiceNum === question.correct_answer;
        const isSelected = choiceNum === question.selected_answer;
        
        return {
          number: choiceNum,
          text: choice,
          isCorrect,
          isSelected,
          explanation: generateChoiceExplanation(choice, isCorrect, question.domain, question.question_type)
        };
      });
      
      const explanation = `
**📋 문제 분석:**
이 문제는 ${question.domain} 영역의 ${question.question_type} 유형 문제입니다.
${question.is_correct ? '정답을 맞히셨습니다! 👏' : `아쉽게 틀리셨네요. 선택하신 ${question.selected_answer || '미선택'}번 대신 ${question.correct_answer}번이 정답입니다. 😔`}

**🎯 정답: ${question.correct_answer}번**

**📝 선택지별 상세 해설:**

${choiceExplanations.map(choice => `
**${choice.number}번: ${choice.text}**
${choice.isCorrect ? '✅ **정답**' : '❌ **오답**'} ${choice.isSelected ? '(선택함)' : ''}
${choice.explanation}
`).join('\n')}

**💡 핵심 개념:**
${question.domain} 분야에서 이 개념은 매우 중요합니다. 특히 물리치료사 국가고시에서 자주 출제되는 유형입니다.

**📚 학습 포인트:**
- 각 선택지의 차이점을 명확히 구분하세요
- 유사한 개념들을 비교 분석하여 학습하세요
- 임상 적용 사례를 함께 학습하세요
- 관련 문제들을 반복 연습하세요

**📖 추천 학습 자료:**
- 물리치료학 교과서 ${question.domain} 챕터
- 국가고시 기출문제 ${question.question_type} 유형
- 임상 실습 가이드라인
- 관련 학술 논문 및 연구 자료
      `;
      
      setAiExplanation(explanation);
    } catch (error) {
      setAiExplanation('에디 해설 생성 중 오류가 발생했습니다.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  // 선택지별 해설 생성 함수
  const generateChoiceExplanation = (choice, isCorrect, domain, questionType) => {
    if (isCorrect) {
      return `이것이 정답인 이유는 ${domain} 분야의 기본 원리에 부합하기 때문입니다. 이 개념은 임상에서 매우 중요하게 적용됩니다.`;
    } else {
      // 오답 선택지에 대한 구체적 설명
      const wrongReasons = [
        `이 선택지는 ${domain} 분야에서 일반적인 오개념입니다. 정확한 개념과 혼동하기 쉬우므로 주의가 필요합니다.`,
        `이 내용은 관련이 있어 보이지만 정확한 답은 아닙니다. 유사한 개념과의 차이점을 명확히 구분해야 합니다.`,
        `이 선택지는 부분적으로만 맞는 내용입니다. 완전한 정답이 되기 위해서는 추가적인 조건이 필요합니다.`,
        `이것은 다른 상황에서는 맞을 수 있지만, 이 문제의 조건에서는 적절하지 않습니다.`,
        `이 선택지는 흔히 하는 실수입니다. 기본 개념을 다시 한번 정리하시기 바랍니다.`
      ];
      
      return wrongReasons[Math.floor(Math.random() * wrongReasons.length)];
    }
  };

  const handleQuestionClick = async (question) => {
    setSelectedQuestion(question);
    setShowExplanation(true);
    await generateAIExplanation(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* 결과 헤더 */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{config.emoji}</div>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
              {config.departmentName} {config.title} 완료!
            </h1>
            <p className="text-xl text-gray-600">에디 분석 결과</p>
          </div>

          {/* 점수 카드 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {testResult.score}점
            </div>
            <div className="text-lg text-gray-600 mb-4">
              총 {testResult.totalQuestions}문제 중 {testResult.correctAnswers}문제 정답
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${testResult.score}%` }}
              ></div>
            </div>
            <div className="text-xl font-semibold mb-2">
              수준: <span className="text-blue-600">{testResult.level}</span>
            </div>
            <p className="text-gray-600">
              {testResult.score >= 80 ? '국가고시 합격 수준입니다! 🌟' : 
               testResult.score >= 65 ? '양호한 결과입니다. 조금만 더 노력하세요! 👍' : 
               testResult.score >= 50 ? '기초를 다시 다져야 합니다. 📚' :
               '전면적 재학습이 필요합니다. 💪'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* 물리치료학과 전용 영역별 분석 */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">🏥 물리치료 영역별 분석</h3>
              <div className="space-y-4">
                {Object.entries(domainStats).map(([domain, stats]) => {
                  const accuracy = (stats.correct / stats.total) * 100;
                  const domainInfo = physicalTherapyDomains[domain] || { icon: '📝', color: 'gray' };
                  
                  return (
                    <div key={domain} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{domainInfo.icon}</span>
                          <span className="font-semibold">{domain}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          accuracy >= 80 ? 'bg-green-100 text-green-800' :
                          accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(accuracy)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-${domainInfo.color}-500`}
                          style={{ width: `${accuracy}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {stats.correct}/{stats.total} 문제 정답
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 동료 비교 분석 */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">👥 동료 비교 분석</h3>
              {testResult.ediAnalysis?.peer_comparison ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      상위 {Math.round(testResult.ediAnalysis.peer_comparison.percentile)}%
                    </div>
                    <p className="text-gray-600">
                                             {testResult.ediAnalysis.peer_comparison.peer_count}명의 물리치료학과 학생과 비교
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span>평균 점수</span>
                                             <span className="font-semibold">{testResult.ediAnalysis.peer_comparison.average_score}점</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>내 점수</span>
                      <span className="font-semibold text-blue-600">{testResult.score}점</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                                         💡 {testResult.score > testResult.ediAnalysis.peer_comparison.average_score ? 
                        '평균보다 높은 우수한 성과입니다!' : 
                        '평균 수준에 도달하기 위해 조금 더 노력해보세요.'}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  비교 데이터를 불러오는 중...
                </div>
              )}
            </div>
          </div>

          {/* 시간 분석 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">⏱️ 시간 분석</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatTimeMs(testResult.timeUsed)}
                </div>
                <div className="text-blue-800 font-medium">총 소요시간</div>
                <div className="text-sm text-blue-600 mt-1">
                  {Math.round(testResult.timeUsed / 1000 / 60)}분 {Math.round((testResult.timeUsed / 1000) % 60)}초
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatTimeMs(testResult.timeUsed / testResult.totalQuestions)}
                </div>
                <div className="text-green-800 font-medium">문제당 평균시간</div>
                <div className="text-sm text-green-600 mt-1">
                  {Math.round(testResult.timeUsed / 1000 / testResult.totalQuestions)}초/문제
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round((testResult.timeUsed / (config.timeLimit * 60 * 1000)) * 100)}%
                </div>
                <div className="text-purple-800 font-medium">시간 사용률</div>
                <div className="text-sm text-purple-600 mt-1">
                  {config.timeLimit}분 중 사용
                </div>
              </div>
            </div>

            {/* 문제별 시간 차트 */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-4">📊 문제별 소요시간</h4>
              <div className="space-y-2">
                {testResult.detailedResults.map((result, index) => {
                  const timeSeconds = Math.round(result.time_spent_ms / 1000);
                  const maxTime = Math.max(...testResult.detailedResults.map(r => r.time_spent_ms));
                  const timePercentage = (result.time_spent_ms / maxTime) * 100;
                  
                  return (
                    <div key={result.question_id} className="flex items-center space-x-3">
                      <div className="w-12 text-sm font-medium text-gray-600">
                        {result.question_number}번
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div 
                          className={`h-6 rounded-full transition-all duration-500 ${
                            result.is_correct ? 'bg-green-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${timePercentage}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                          {timeSeconds}초
                        </div>
                      </div>
                      <div className={`w-16 text-xs font-medium ${
                        result.is_correct ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.is_correct ? '✅ 정답' : '❌ 오답'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

                         {/* AI 시간 분석 인사이트 */}
             <div className="bg-yellow-50 rounded-lg p-4">
                               <h4 className="font-semibold text-yellow-800 mb-2">🤖 에디의 시간 분석 인사이트</h4>
               <div className="text-yellow-700 text-sm space-y-1">
                 {(() => {
                   const avgTime = testResult.timeUsed / testResult.totalQuestions / 1000;
                   
                   // 🧠 AI 분석: 시간과 정답률을 함께 고려
                   const fastCorrect = testResult.detailedResults.filter(r => 
                     r.time_spent_ms / 1000 < avgTime * 0.7 && r.is_correct
                   );
                   const fastWrong = testResult.detailedResults.filter(r => 
                     r.time_spent_ms / 1000 < avgTime * 0.7 && !r.is_correct
                   );
                   const slowCorrect = testResult.detailedResults.filter(r => 
                     r.time_spent_ms / 1000 > avgTime * 1.5 && r.is_correct
                   );
                   const slowWrong = testResult.detailedResults.filter(r => 
                     r.time_spent_ms / 1000 > avgTime * 1.5 && !r.is_correct
                   );
                   
                   return (
                     <>
                       <div>• 평균 문제 해결 시간: {Math.round(avgTime)}초</div>
                       
                       {fastCorrect.length > 0 && (
                         <div className="text-green-700">
                           • ✅ 빠르고 정확한 문제: {fastCorrect.length}개 (진짜 자신감 영역!)
                         </div>
                       )}
                       
                       {fastWrong.length > 0 && (
                         <div className="text-red-700">
                           • ⚡❌ 빠르지만 틀린 문제: {fastWrong.length}개 (성급함 주의, 신중함 필요)
                         </div>
                       )}
                       
                       {slowCorrect.length > 0 && (
                         <div className="text-blue-700">
                           • 🤔✅ 신중하게 맞힌 문제: {slowCorrect.length}개 (어려웠지만 잘 해결)
                         </div>
                       )}
                       
                       {slowWrong.length > 0 && (
                         <div className="text-purple-700">
                           • 🐌❌ 오래 걸리고 틀린 문제: {slowWrong.length}개 (집중 학습 필요)
                         </div>
                       )}
                       
                       <div className="mt-2 pt-2 border-t border-yellow-200">
                         <strong>🎯 에디의 종합 분석:</strong>
                         {(() => {
                           const totalFast = fastCorrect.length + fastWrong.length;
                           const totalSlow = slowCorrect.length + slowWrong.length;
                           
                           if (fastWrong.length > fastCorrect.length) {
                             return ' 빠른 판단보다는 신중한 접근이 필요합니다. 문제를 꼼꼼히 읽어보세요.';
                           } else if (slowWrong.length > slowCorrect.length) {
                             return ' 시간을 들여도 틀리는 문제가 많습니다. 기본 개념 학습이 우선입니다.';
                           } else if (fastCorrect.length > 5) {
                             return ' 빠르고 정확한 문제 해결 능력이 뛰어납니다! 👏';
                           } else {
                             return ' 전반적으로 균형잡힌 문제 해결 패턴을 보입니다.';
                           }
                         })()}
                       </div>
                       
                       <div>• 시간 관리: {testResult.timeUsed / (config.timeLimit * 60 * 1000) > 0.8 ? 
                         '시간을 충분히 활용했습니다' : '시간 여유가 있었습니다'}</div>
                     </>
                   );
                 })()}
               </div>
             </div>
          </div>

          {/* 문제별 상세 결과 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">📝 문제별 상세 결과</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
              {testResult.detailedResults.map((result, index) => (
                <button
                  key={result.question_id}
                  onClick={() => handleQuestionClick(result)}
                  className={`w-12 h-12 rounded-lg font-semibold text-sm transition-all hover:scale-105 relative ${
                    result.is_correct 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                  title={`문제 ${result.question_number}: ${result.is_correct ? '정답' : '오답'} (${Math.round(result.time_spent_ms / 1000)}초)`}
                >
                  {result.question_number}
                  <div className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Math.round(result.time_spent_ms / 1000)}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>정답 ({testResult.correctAnswers}개)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>오답 ({testResult.wrongAnswers}개)</span>
              </div>
              <div className="text-blue-600">
                💡 문제 번호를 클릭하면 에디의 해설을 볼 수 있습니다
              </div>
              <div className="text-purple-600">
                ⏱️ 우측 하단 숫자는 소요시간(초)입니다
              </div>
            </div>
          </div>

          {/* AI 맞춤 학습 방향 제시 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">🎯 에디의 맞춤 학습 방향</h3>
            <div className="space-y-4">
              {(() => {
                const recommendations = [];
                const avgTime = testResult.timeUsed / testResult.totalQuestions / 1000;
                
                                 // 🧠 에디 분석: 시간과 정답률 패턴 기반 추천
                const fastCorrect = testResult.detailedResults.filter(r => 
                  r.time_spent_ms / 1000 < avgTime * 0.7 && r.is_correct
                );
                const fastWrong = testResult.detailedResults.filter(r => 
                  r.time_spent_ms / 1000 < avgTime * 0.7 && !r.is_correct
                );
                const slowWrong = testResult.detailedResults.filter(r => 
                  r.time_spent_ms / 1000 > avgTime * 1.5 && !r.is_correct
                );
                
                // 점수별 기본 추천
                if (testResult.score >= 80) {
                  recommendations.push({
                    category: '🌟 우수 학습자',
                    title: '심화 학습 및 실전 대비',
                    description: '국가고시 합격 수준입니다! 심화 문제와 최신 출제 경향을 학습하여 더욱 완벽한 준비를 하세요.',
                    color: 'green'
                  });
                } else if (testResult.score >= 65) {
                  recommendations.push({
                    category: '📚 중급 단계',
                    title: '약점 보완 및 실력 향상',
                    description: '합격권에 근접했습니다. 틀린 문제 유형을 집중 분석하여 마지막 도약을 준비하세요.',
                    color: 'blue'
                  });
                } else {
                  recommendations.push({
                    category: '💪 기초 강화',
                    title: '기본기 다지기 우선',
                    description: '기본 개념부터 체계적으로 학습하세요. 무리하지 말고 차근차근 실력을 쌓아가는 것이 중요합니다.',
                    color: 'red'
                  });
                }
                
                // 성급함 패턴 분석
                if (fastWrong.length > fastCorrect.length) {
                  recommendations.push({
                    category: '⚡ 성급함 개선',
                    title: '신중한 문제 해결 습관 기르기',
                    description: `빠르게 풀었지만 틀린 문제가 ${fastWrong.length}개입니다. 문제를 끝까지 꼼꼼히 읽고, 선택지를 신중히 검토하는 습관을 기르세요.`,
                    color: 'orange'
                  });
                }
                
                // 기본기 부족 패턴 분석
                if (slowWrong.length > 5) {
                  recommendations.push({
                    category: '🐌 기본 개념 부족',
                    title: '기초 이론 재학습 필요',
                    description: `시간을 들여도 틀린 문제가 ${slowWrong.length}개입니다. 해당 영역의 기본 개념부터 다시 학습하는 것을 권장합니다.`,
                    color: 'purple'
                  });
                }
                
                // 영역별 약점 분석
                const weakDomains = Object.entries(domainStats)
                  .filter(([_, stats]) => (stats.correct / stats.total) < 0.6)
                  .map(([domain, _]) => domain);
                
                if (weakDomains.length > 0) {
                  recommendations.push({
                    category: '📖 약점 영역 집중',
                    title: `${weakDomains.slice(0, 3).join(', ')} 영역 강화`,
                    description: `특히 ${weakDomains.join(', ')} 영역에서 정답률이 낮습니다. 해당 영역의 교과서와 기출문제를 집중적으로 학습하세요.`,
                    color: 'indigo'
                  });
                }
                
                // 강점 영역 활용
                const strongDomains = Object.entries(domainStats)
                  .filter(([_, stats]) => (stats.correct / stats.total) >= 0.8)
                  .map(([domain, _]) => domain);
                
                if (strongDomains.length > 0) {
                  recommendations.push({
                    category: '✅ 강점 활용',
                    title: `${strongDomains.slice(0, 3).join(', ')} 영역 심화`,
                    description: `${strongDomains.join(', ')} 영역은 잘하고 있습니다! 이 강점을 바탕으로 관련 심화 내용과 최신 연구 동향을 학습해보세요.`,
                    color: 'teal'
                  });
                }
                
                // 시간 관리 추천
                const timeUsageRatio = testResult.timeUsed / (config.timeLimit * 60 * 1000);
                if (timeUsageRatio < 0.5) {
                  recommendations.push({
                    category: '⏰ 시간 활용',
                    title: '더 신중한 문제 검토',
                    description: '시간이 많이 남았습니다. 답을 선택한 후 다시 한번 검토하는 습관을 기르면 정답률을 더 높일 수 있습니다.',
                    color: 'gray'
                  });
                } else if (timeUsageRatio > 0.9) {
                  recommendations.push({
                    category: '⏰ 시간 관리',
                    title: '문제 해결 속도 향상',
                    description: '시간이 부족했습니다. 기본 개념을 더 확실히 익혀서 빠른 판단력을 기르고, 시간 배분 연습을 하세요.',
                    color: 'gray'
                  });
                }
                
                return recommendations.map((rec, index) => (
                  <div key={index} className={`border-l-4 border-${rec.color}-500 pl-4 py-3 bg-${rec.color}-50 rounded-r-lg`}>
                    <div className={`font-semibold text-${rec.color}-800 mb-1`}>{rec.category}</div>
                    <div className={`text-${rec.color}-700 font-medium mb-2`}>{rec.title}</div>
                    <div className={`text-sm text-${rec.color}-600`}>{rec.description}</div>
                  </div>
                ));
              })()}
            </div>
            
            {/* 구체적 학습 계획 */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                             <h4 className="font-semibold text-gray-800 mb-4">📋 구체적 학습 계획 (에디 추천)</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-blue-800 mb-2">🎯 단기 목표 (1-2주)</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {(() => {
                      const shortTermGoals = [];
                      
                      if (testResult.score < 65) {
                        shortTermGoals.push('기본 개념 정리 (교과서 1회독)');
                        shortTermGoals.push('틀린 문제 유형 분석 및 재학습');
                      } else {
                        shortTermGoals.push('약점 영역 집중 학습');
                        shortTermGoals.push('기출문제 패턴 분석');
                      }
                      
                      const fastWrong = testResult.detailedResults.filter(r => 
                        r.time_spent_ms / 1000 < (testResult.timeUsed / testResult.totalQuestions / 1000) * 0.7 && !r.is_correct
                      );
                      
                      if (fastWrong.length > 5) {
                        shortTermGoals.push('문제 꼼꼼히 읽기 연습');
                      }
                      
                      return shortTermGoals.map((goal, index) => (
                        <li key={index}>• {goal}</li>
                      ));
                    })()}
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-medium text-purple-800 mb-2">🚀 장기 목표 (1-2개월)</h5>
                  <ul className="text-sm text-purple-700 space-y-1">
                    {(() => {
                      const longTermGoals = [];
                      
                      if (testResult.score >= 80) {
                        longTermGoals.push('심화 문제 도전 및 실전 모의고사');
                        longTermGoals.push('최신 출제 경향 분석');
                      } else if (testResult.score >= 65) {
                        longTermGoals.push('전 영역 균형잡힌 학습');
                        longTermGoals.push('모의고사 80점 이상 달성');
                      } else {
                        longTermGoals.push('기본기 완성 후 응용 문제 도전');
                        longTermGoals.push('65점 이상 안정적 달성');
                      }
                      
                      longTermGoals.push('국가고시 실전 대비 전략 수립');
                      
                      return longTermGoals.map((goal, index) => (
                        <li key={index}>• {goal}</li>
                      ));
                    })()}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="text-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              대시보드로 이동
            </button>
            <button
              onClick={onRestart}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              다시 응시
            </button>
          </div>
        </div>
      </div>

      {/* AI 해설 모달 */}
      {showExplanation && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                                 <h3 className="text-2xl font-semibold text-gray-800">
                   🤖 문제 {selectedQuestion.question_number} 에디의 해설
                 </h3>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
                             <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                 <div className="flex items-center space-x-4 mb-2">
                   <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                     selectedQuestion.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                   }`}>
                     {selectedQuestion.is_correct ? '✅ 정답' : '❌ 오답'}
                   </span>
                   <span className="text-sm text-gray-600">
                     {selectedQuestion.domain} | {selectedQuestion.question_type}
                   </span>
                   <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                     ⏱️ {Math.round(selectedQuestion.time_spent_ms / 1000)}초
                   </span>
                 </div>
                 <div className="text-sm text-gray-600">
                   선택한 답: {selectedQuestion.selected_answer || '미선택'}번 | 
                   정답: {selectedQuestion.correct_answer}번 | 
                   소요시간: {formatTimeMs(selectedQuestion.time_spent_ms)}
                 </div>
                 
                 {/* 에디의 시간 분석 */}
                 <div className="mt-3 text-xs">
                   {(() => {
                     const avgTime = testResult.timeUsed / testResult.totalQuestions;
                     const thisTime = selectedQuestion.time_spent_ms;
                     const timeRatio = thisTime / avgTime;
                     const isCorrect = selectedQuestion.is_correct;
                     
                     if (timeRatio > 1.5 && isCorrect) {
                       return <span className="text-blue-600">🤔✅ 신중하게 접근해서 정답을 맞혔습니다! 어려운 문제였지만 잘 해결했어요.</span>;
                     } else if (timeRatio > 1.5 && !isCorrect) {
                       return <span className="text-purple-600">🐌❌ 시간을 많이 들였지만 틀렸습니다. 이 영역은 집중 학습이 필요해요.</span>;
                     } else if (timeRatio < 0.7 && isCorrect) {
                       return <span className="text-green-600">⚡✅ 빠르고 정확하게 해결했습니다! 진짜 자신감 있는 영역이네요.</span>;
                     } else if (timeRatio < 0.7 && !isCorrect) {
                       return <span className="text-red-600">⚡❌ 빠르게 풀었지만 틀렸습니다. 성급함보다는 신중함이 필요해요.</span>;
                     } else if (isCorrect) {
                       return <span className="text-gray-600">⏱️✅ 적절한 시간으로 정답을 맞혔습니다.</span>;
                     } else {
                       return <span className="text-gray-600">⏱️❌ 평균적인 시간이었지만 아쉽게 틀렸네요.</span>;
                     }
                   })()}
                 </div>
               </div>

                             <div className="max-w-none">
                 {loadingExplanation ? (
                   <div className="text-center py-8">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                     <p className="text-gray-600">에디가 모든 선택지를 분석하고 있습니다...</p>
                     <p className="text-sm text-gray-500 mt-2">정답과 오답의 이유를 상세히 설명해드릴게요 💕</p>
                   </div>
                 ) : (
                   <div className="space-y-6">
                     {/* 문제 분석 섹션 */}
                     <div className="bg-blue-50 rounded-lg p-4">
                       <h4 className="font-semibold text-blue-800 mb-2">📋 문제 분석</h4>
                       <p className="text-blue-700">
                         이 문제는 {selectedQuestion.domain} 영역의 {selectedQuestion.question_type} 유형 문제입니다.
                         {selectedQuestion.is_correct ? ' 정답을 맞히셨습니다! 👏' : 
                          ` 아쉽게 틀리셨네요. 선택하신 ${selectedQuestion.selected_answer || '미선택'}번 대신 ${selectedQuestion.correct_answer}번이 정답입니다. 😔`}
                       </p>
                     </div>

                     {/* 정답 표시 */}
                     <div className="bg-green-50 rounded-lg p-4">
                       <h4 className="font-semibold text-green-800 mb-2">🎯 정답: {selectedQuestion.correct_answer}번</h4>
                     </div>

                                           {/* 선택지별 해설 */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4">📝 선택지별 상세 해설</h4>
                                                <div className="space-y-4">
                          {questions?.find(q => q.question_id === selectedQuestion.question_id)?.choices?.length > 0 ? 
                            questions.find(q => q.question_id === selectedQuestion.question_id).choices.map((choice, index) => {
                              const choiceNum = (index + 1).toString();
                              const isCorrect = choiceNum === selectedQuestion.correct_answer;
                              const isSelected = choiceNum === selectedQuestion.selected_answer;
                              
                              return (
                                <div key={index} className={`border-2 rounded-lg p-4 ${
                                  isCorrect ? 'border-green-300 bg-green-50' : 
                                  isSelected ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                                }`}>
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                      isCorrect ? 'bg-green-500 text-white' :
                                      isSelected ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'
                                    }`}>
                                      {choiceNum}
                                    </span>
                                    <span className="font-medium text-gray-800">{choice}</span>
                                    <div className="flex space-x-2">
                                      {isCorrect && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">✅ 정답</span>}
                                      {isSelected && !isCorrect && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">선택함</span>}
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-700 ml-11">
                                    {isCorrect ? 
                                      `이것이 정답인 이유는 ${selectedQuestion.domain} 분야의 기본 원리에 부합하기 때문입니다. 이 개념은 임상에서 매우 중요하게 적용됩니다.` :
                                      `이 선택지는 ${selectedQuestion.domain} 분야에서 혼동하기 쉬운 개념입니다. 정확한 개념과의 차이점을 명확히 구분해야 합니다.`
                                    }
                                  </div>
                                </div>
                              );
                            }) : (
                              <div className="text-center text-gray-500 py-8">
                                <p>선택지 데이터를 불러올 수 없습니다.</p>
                                <p className="text-sm mt-2">문제 데이터를 다시 확인해주세요.</p>
                              </div>
                            )
                          }
                        </div>
                     </div>

                     {/* 핵심 개념 */}
                     <div className="bg-yellow-50 rounded-lg p-4">
                       <h4 className="font-semibold text-yellow-800 mb-2">💡 핵심 개념</h4>
                       <p className="text-yellow-700">
                         {selectedQuestion.domain} 분야에서 이 개념은 매우 중요합니다. 
                         특히 물리치료사 국가고시에서 자주 출제되는 유형입니다.
                       </p>
                     </div>

                     {/* 학습 포인트 */}
                     <div className="bg-purple-50 rounded-lg p-4">
                       <h4 className="font-semibold text-purple-800 mb-2">📚 학습 포인트</h4>
                       <ul className="text-purple-700 space-y-1 text-sm">
                         <li>• 각 선택지의 차이점을 명확히 구분하세요</li>
                         <li>• 유사한 개념들을 비교 분석하여 학습하세요</li>
                         <li>• 임상 적용 사례를 함께 학습하세요</li>
                         <li>• 관련 문제들을 반복 연습하세요</li>
                       </ul>
                     </div>

                     {/* 추천 학습 자료 */}
                     <div className="bg-indigo-50 rounded-lg p-4">
                       <h4 className="font-semibold text-indigo-800 mb-2">📖 추천 학습 자료</h4>
                       <ul className="text-indigo-700 space-y-1 text-sm">
                         <li>• 물리치료학 교과서 {selectedQuestion.domain} 챕터</li>
                         <li>• 국가고시 기출문제 {selectedQuestion.question_type} 유형</li>
                         <li>• 임상 실습 가이드라인</li>
                         <li>• 관련 학술 논문 및 연구 자료</li>
                       </ul>
                     </div>
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalDiagnosticTest; 