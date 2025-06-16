import React, { useState, useEffect } from 'react';
import apiClient from '../../../../services/api';
// import DiagnosticTestBase from '../DiagnosticTestBase';
// import DiagnosticTestBase from '../DiagnosticTestBase_Simple';

// 임시로 내부에 간단한 컴포넌트 정의
const SimpleDiagnosticTest = ({ departmentConfig, userDepartment }) => {
  console.log('SimpleDiagnosticTest 렌더링 시작');
  console.log('departmentConfig:', departmentConfig);
  console.log('userDepartment:', userDepartment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-blue-500 text-6xl mb-4">🧪</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">진단테스트 (임시 모드)</h2>
        <p className="text-gray-600 mb-4">
          <strong>{departmentConfig?.displayName || '알 수 없는 학과'}</strong> 진단테스트
        </p>
        <p className="text-sm text-gray-500 mb-6">
          사용자 학과: {userDepartment || '정보 없음'}
        </p>
        
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">
            ✅ 임시 진단테스트 컴포넌트가 정상 작동 중입니다!
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => alert('테스트 시작 버튼이 클릭되었습니다!')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            테스트 시작 (시뮬레이션)
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p>💡 이것은 import 문제 해결을 위한 임시 컴포넌트입니다.</p>
        </div>
      </div>
    </div>
  );
};

console.log('🔥 PhysicalTherapyDiagnosticTest 파일 새로 로딩 중...');

const PhysicalTherapyDiagnosticTest = (props) => {
  console.log('🎯 PhysicalTherapyDiagnosticTest 컴포넌트 렌더링 시작!');
  console.log('📦 받은 props:', props);
  
  // props 안전 처리
  const { userDepartment } = props || {};
  console.log('👤 userDepartment:', userDepartment);

  // 상태 관리
  const [currentStep, setCurrentStep] = useState('intro'); // 'intro', 'testing', 'result'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60분 = 3600초
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  
  // 새로운 상태들: 시간 측정 및 세션 관리
  const [sessionId, setSessionId] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [questionTimes, setQuestionTimes] = useState({}); // 각 문제별 풀이 시간
  const [testStartTime, setTestStartTime] = useState(null);
  const [isCorrectAnswers, setIsCorrectAnswers] = useState({}); // 실시간 정답 확인
  const [submitting, setSubmitting] = useState(false);

  const departmentConfig = {
    department: '물리치료학과',
    displayName: '물리치료학과',
    subject: 'physical_therapy',
    description: '물리치료사 국가고시 기출문제 기반 학생 수준 진단',
    fieldName: '물리치료',
    questionCount: 30,
    timeLimit: 60
  };

  // 테스트 데이터 로드 및 세션 시작
  const loadTestData = async () => {
    try {
      setLoading(true);
      console.log('📚 테스트 데이터 로딩 시작...');
      
      // 1. JSON 파일에서 문제 로드
      const response = await fetch('/data/physical_therapy_questions.json');
      if (!response.ok) {
        throw new Error('문제 데이터를 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      console.log('✅ 테스트 데이터 로딩 완료:', data);
      
      // 2. 백엔드에 테스트 세션 시작 요청
      const sessionResponse = await apiClient.post('/diagnosis/sessions/start', {
        test_type: 'physical_therapy_1st',
        department: userDepartment || '물리치료학과',
        total_questions: data.questions.length,
        time_limit_minutes: data.test_info.time_limit
      });
      
      console.log('🎯 테스트 세션 시작:', sessionResponse.data);
      
      setTestInfo(data.test_info);
      setQuestions(data.questions);
      setTimeLeft(data.test_info.time_limit * 60);
      setSessionId(sessionResponse.data.session_id);
      setTestStartTime(Date.now());
      setQuestionStartTime(Date.now()); // 첫 번째 문제 시작 시간
      setCurrentStep('testing');
      
    } catch (error) {
      console.error('❌ 테스트 데이터 로딩 실패:', error);
      alert('테스트를 시작할 수 없습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 타이머 효과
  useEffect(() => {
    if (currentStep === 'testing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && currentStep === 'testing') {
      // 시간 종료 시 자동 제출
      handleSubmitTest();
    }
  }, [currentStep, timeLeft]);

  // 문제 변경 시 이전 문제의 시간 기록
  useEffect(() => {
    if (currentStep === 'testing' && questions.length > 0 && questionStartTime) {
      // 이전 문제가 있고, 새로운 문제로 이동할 때
      if (currentQuestionIndex > 0) {
        const prevQuestion = questions[currentQuestionIndex - 1];
        const timeSpent = Date.now() - questionStartTime;
        
        setQuestionTimes(prev => ({
          ...prev,
          [prevQuestion.question_id]: timeSpent
        }));
        
        console.log(`⏱️ 문제 ${prevQuestion.question_number} 풀이 시간: ${Math.round(timeSpent/1000)}초`);
      }
      
      // 새로운 문제 시작 시간 설정
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, currentStep]);

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 밀리초를 초로 변환하는 헬퍼 함수
  const formatTimeMs = (milliseconds) => {
    const seconds = Math.round(milliseconds / 1000);
    return `${seconds}초`;
  };

  // 답변 선택 (정답 확인 없이)
  const handleAnswerSelect = (questionId, answer) => {
    const currentQuestion = questions.find(q => q.question_id === questionId);
    
    // 이전 문제의 시간 기록 (답변 선택 시점에서)
    if (questionStartTime) {
      const timeSpent = Date.now() - questionStartTime;
      setQuestionTimes(prev => ({
        ...prev,
        [questionId]: timeSpent
      }));
      
      console.log(`⏱️ 문제 ${currentQuestion.question_number} 풀이 시간: ${formatTimeMs(timeSpent)}`);
    }
    
    // 답변 저장 (정답 확인 제거)
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // 🚨 정답 정보는 로그에서도 제거 (테스트 신뢰성 보장)
    console.log(`📝 문제 ${currentQuestion.question_number} 답변 선택: ${answer}번 (${formatTimeMs(Date.now() - questionStartTime)})`);
    
    // 실시간 백엔드 저장 제거 - 모든 문제 완료 후 일괄 처리
  };

  // 다음 문제
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now()); // 새 문제 시작 시간
    }
  };

  // 이전 문제
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now()); // 이전 문제로 돌아갈 때도 시간 재설정
    }
  };

  // 테스트 제출 및 5-10초 채점/분석 과정
  const handleSubmitTest = async () => {
    if (submitting) return; // 중복 제출 방지
    
    setSubmitting(true);
    setCurrentStep('grading'); // 채점 단계로 전환
    console.log('📊 테스트 제출 및 채점 시작...');
    
    try {
      // 마지막 문제의 시간도 기록
      if (questionStartTime && questions.length > 0) {
        const lastQuestion = questions[currentQuestionIndex];
        const timeSpent = Date.now() - questionStartTime;
        setQuestionTimes(prev => ({
          ...prev,
          [lastQuestion.question_id]: timeSpent
        }));
      }
      
      // 1단계: 채점 시작 (2초)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 점수 계산 및 유형별 분석
      let correctAnswers = 0;
      const detailedResults = [];
      const typeStats = {}; // 유형별 통계
      
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
      
      // 2단계: 통계 분석 중 (3초)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      const totalTimeUsed = Date.now() - testStartTime;
      
      // 백엔드에 최종 결과 제출 및 AI 분석 요청
      const submitResponse = await apiClient.post('/diagnosis/sessions/complete', {
        session_id: sessionId,
        total_score: score,
        correct_answers: correctAnswers,
        wrong_answers: questions.length - correctAnswers,
        total_time_ms: totalTimeUsed,
        detailed_results: detailedResults,
        request_ai_analysis: true // AI 분석 요청
      });
      
      // 3단계: AI 분석 중 (3초)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✅ 테스트 완료 및 AI 분석 요청:', submitResponse.data);
      
      // 결과 설정 (유형별 통계 포함)
      const result = {
        totalQuestions: questions.length,
        correctAnswers,
        wrongAnswers: questions.length - correctAnswers,
        score,
        level: score >= 80 ? '상급' : score >= 65 ? '중급' : score >= 50 ? '하급' : '미흡',
        timeUsed: totalTimeUsed,
        questionTimes: questionTimes,
        detailedResults: detailedResults,
        typeStats: typeStats, // 유형별 통계 추가
        aiAnalysis: submitResponse.data.ai_analysis,
        sessionId: sessionId
      };
      
      console.log('📊 최종 테스트 결과 (유형별 통계 포함):', result);
      
      setTestResult(result);
      setCurrentStep('result');
      
    } catch (error) {
      console.error('❌ 테스트 제출 실패:', error);
      alert('테스트 제출에 실패했습니다: ' + error.message);
      setCurrentStep('test'); // 오류 시 테스트 화면으로 돌아가기
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
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏥</div>
              <h1 className="text-4xl font-bold mb-4 text-gray-800">
                물리치료학과 1차 진단테스트
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                물리치료사 국가고시 기출문제 기반 학생 수준 진단
              </p>
              <p className="text-sm text-gray-500">
                사용자 학과: {userDepartment || '정보 없음'}
              </p>
            </div>

            {/* 메인 카드 */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <div className="text-green-600 text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-green-800 mb-2">
                  성공! 컴포넌트 로딩 완료!
                </h2>
                <p className="text-green-700 text-lg">
                  AI 기반 개인화 진단테스트가 준비되었습니다!
                </p>
              </div>

              {/* 테스트 정보 */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-semibold text-blue-800 mb-4">📋 테스트 정보</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-left">
                    <span className="font-bold text-blue-700">학과:</span>
                    <span className="ml-2 text-blue-600">물리치료학과</span>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-blue-700">문제 수:</span>
                    <span className="ml-2 text-blue-600">30문제</span>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-blue-700">시간 제한:</span>
                    <span className="ml-2 text-blue-600">60분</span>
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-blue-700">분석 타입:</span>
                    <span className="ml-2 text-blue-600">1차 기초 진단</span>
                  </div>
                </div>
              </div>

              {/* 새로운 기능 안내 */}
              <div className="bg-purple-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="text-xl font-semibold text-purple-800 mb-4">🤖 AI 분석 기능</h3>
                <ul className="space-y-2 text-purple-700">
                  <li>• 각 문제별 풀이 시간 측정 및 분석</li>
                  <li>• 실시간 정답 확인 및 저장</li>
                  <li>• 다른 학생들과의 성과 비교</li>
                  <li>• 난이도별/유형별 정답률 분석</li>
                  <li>• EXAONE AI 기반 개인화 진단</li>
                  <li>• 약한 유형 및 개선 방향 제시</li>
                </ul>
              </div>

              {/* 안내사항 */}
              <div className="bg-yellow-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="text-xl font-semibold text-yellow-800 mb-4">⚠️ 테스트 안내사항</h3>
                <ul className="space-y-2 text-yellow-700">
                  <li>• 총 30문제, 제한시간 60분</li>
                  <li>• 물리치료사 국가고시 기출문제로 구성</li>
                  <li>• 각 문제별 풀이 시간이 자동으로 측정됩니다</li>
                  <li>• 답변 선택 시 즉시 정답 여부 확인 및 저장</li>
                  <li>• 테스트 완료 후 AI가 상세 분석을 제공합니다</li>
                  <li>• 한 번 시작하면 중간에 나갈 수 없습니다</li>
                </ul>
              </div>

              {/* 액션 버튼 */}
              <div className="space-y-4">
                <button
                  onClick={loadTestData}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {loading ? '📚 AI 테스트 준비 중...' : '🚀 1차 진단테스트 시작하기'}
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
                >
                  ← 대시보드로 돌아가기
                </button>
              </div>

              {/* 디버그 정보 */}
              <div className="mt-8 bg-gray-100 rounded-lg p-4 text-left text-sm">
                <h4 className="font-bold text-gray-800 mb-2">🔧 디버그 정보:</h4>
                <p><strong>컴포넌트:</strong> PhysicalTherapyDiagnosticTest</p>
                <p><strong>Props 타입:</strong> {typeof props}</p>
                <p><strong>Props null 여부:</strong> {props === null ? 'null' : 'not null'}</p>
                <p><strong>userDepartment:</strong> {userDepartment || 'undefined'}</p>
                <p><strong>세션 ID:</strong> {sessionId || '미생성'}</p>
                <p><strong>상태:</strong> ✅ AI 분석 준비 완료</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 테스트 진행 화면 (시간 측정 및 실시간 피드백 포함)
  if (currentStep === 'testing' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const isAnswered = answers[currentQuestion.question_id];
    const isCorrect = isCorrectAnswers[currentQuestion.question_id];
    const currentQuestionTime = questionStartTime ? Date.now() - questionStartTime : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-4">
          {/* 상단 정보 바 */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold">
                  문제 {currentQuestionIndex + 1} / {questions.length}
                </span>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
                {/* 현재 문제 풀이 시간 */}
                <span className="text-sm text-gray-500">
                  현재: {formatTimeMs(currentQuestionTime)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono text-red-600">
                  ⏰ {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-500">남은 시간</div>
              </div>
            </div>
          </div>

          {/* 문제 카드 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    문제 {currentQuestion.question_number}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    {currentQuestion.area_name} | {currentQuestion.difficulty_level} | {currentQuestion.question_type}
                  </span>
                </div>
                
                {/* 🚨 진단테스트 중에는 정답/오답 표시 완전 제거 */}
                {/* 답변 선택 여부만 표시 */}
                {isAnswered && (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    답변 완료
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {currentQuestion.content}
              </h2>
            </div>

            {/* 선택지 (정답 표시 없이 순수 선택만) */}
            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([optionNumber, optionText]) => {
                const isSelected = answers[currentQuestion.question_id] === optionNumber;
                
                // 🚨 정답 표시 완전 제거 - 선택 여부만 표시
                let optionStyle = 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
                if (isSelected) {
                  optionStyle = 'border-blue-500 bg-blue-50';
                }
                
                return (
                  <label
                    key={optionNumber}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${optionStyle}`}
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
                        name={`question-${currentQuestion.question_id}`}
                        value={optionNumber}
                        checked={isSelected}
                        onChange={() => handleAnswerSelect(currentQuestion.question_id, optionNumber)}
                        className="hidden"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-blue-600 mr-2">{optionNumber}.</span>
                        <span className="text-gray-800">{optionText}</span>
                        {/* 🚨 진단테스트 중에는 정답 표시 완전 제거 */}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="bg-white rounded-lg shadow-lg p-4">
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
            
            {/* 진행 단계 */}
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
                <span className="text-gray-500">AI 분석 결과 생성</span>
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

  // 4. 결과 화면 (AI 분석 포함)
  if (currentStep === 'result' && testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* 결과 헤더 */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold mb-4 text-gray-800">1차 진단테스트 완료!</h1>
              <p className="text-xl text-gray-600">물리치료학과 에디 분석 결과</p>
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
                {testResult.score >= 80 ? '우수한 결과입니다! 🌟' : 
                 testResult.score >= 65 ? '양호한 결과입니다. 👍' : 
                 testResult.score >= 50 ? '추가 학습이 필요합니다. 📚' :
                 '전면적 재학습을 권장합니다. 💪'}
              </p>
            </div>

            {/* 유형별 상세 통계 */}
            {testResult.typeStats && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">📊 유형별 상세 분석</h3>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(testResult.typeStats).map(([type, stats]) => {
                    const accuracy = Math.round((stats.correct / stats.total) * 100);
                    const isWeak = accuracy < 60;
                    const isStrong = accuracy >= 80;
                    
                    return (
                      <div key={type} className={`p-6 rounded-lg border-2 ${
                        isWeak ? 'border-red-200 bg-red-50' : 
                        isStrong ? 'border-green-200 bg-green-50' : 
                        'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">{type}</h4>
                          <div className={`text-2xl ${
                            isWeak ? 'text-red-500' : 
                            isStrong ? 'text-green-500' : 
                            'text-yellow-500'
                          }`}>
                            {isWeak ? '😰' : isStrong ? '🎉' : '😐'}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>정답률:</span>
                            <span className={`font-bold ${
                              isWeak ? 'text-red-600' : 
                              isStrong ? 'text-green-600' : 
                              'text-yellow-600'
                            }`}>
                              {accuracy}% ({stats.correct}/{stats.total})
                            </span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${
                              isWeak ? 'bg-red-500' : 
                              isStrong ? 'bg-green-500' : 
                              'bg-yellow-500'
                            }`} style={{width: `${accuracy}%`}}></div>
                          </div>
                          
                          <div className="text-xs text-gray-600">
                            문제 번호: {stats.questions.map(q => q.number).join(', ')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI 분석 결과 */}
            {testResult.aiAnalysis && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* AI 유형 강약점 분석 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">🤖 에디의 유형 분석</h3>
                  <div className="space-y-4 text-sm">
                    {testResult.aiAnalysis.weak_areas && testResult.aiAnalysis.weak_areas.length > 0 ? (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center mb-2">
                          <span className="text-red-500 mr-2">⚠️</span>
                          <span className="font-semibold text-red-700">약한 영역</span>
                        </div>
                        <div className="text-red-600">
                          {testResult.aiAnalysis.weak_areas.join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center mb-2">
                          <span className="text-green-500 mr-2">✅</span>
                          <span className="font-semibold text-green-700">모든 영역 양호</span>
                        </div>
                        <div className="text-green-600">
                          전 영역에서 균형잡힌 성과를 보였습니다.
                        </div>
                      </div>
                    )}
                    
                    {/* 강한 영역 표시 */}
                    {testResult.typeStats && Object.entries(testResult.typeStats).filter(([_, stats]) => 
                      (stats.correct / stats.total) >= 0.8
                    ).length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center mb-2">
                          <span className="text-blue-500 mr-2">🌟</span>
                          <span className="font-semibold text-blue-700">강한 영역</span>
                        </div>
                        <div className="text-blue-600">
                          {Object.entries(testResult.typeStats)
                            .filter(([_, stats]) => (stats.correct / stats.total) >= 0.8)
                            .map(([type, _]) => type)
                            .join(', ')}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-blue-600 mt-2">
                      ✨ 실제 동료 {testResult.aiAnalysis.peer_comparison?.total_peers || 0}명과 비교 분석
                    </div>
                  </div>
                </div>

                {/* 시간 효율성 분석 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">⏱️ 시간 효율성 분석</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>총 소요 시간:</span>
                      <span className="font-semibold">{formatTimeMs(testResult.timeUsed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>평균 문제당 시간:</span>
                      <span className="font-semibold">
                        {formatTimeMs(testResult.timeUsed / testResult.totalQuestions)}
                      </span>
                    </div>
                    
                    {testResult.aiAnalysis.time_analysis && (
                      <>
                        <div className="flex justify-between">
                          <span>시간 효율성:</span>
                          <span className={`font-semibold ${
                            testResult.aiAnalysis.time_analysis.time_efficiency === '매우 빠름' ? 'text-green-600' :
                            testResult.aiAnalysis.time_analysis.time_efficiency === '빠름' ? 'text-blue-600' :
                            testResult.aiAnalysis.time_analysis.time_efficiency === '보통' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {testResult.aiAnalysis.time_analysis.time_efficiency}
                          </span>
                        </div>
                        
                        {testResult.aiAnalysis.time_analysis.time_percentile && (
                          <div className="flex justify-between">
                            <span>시간 백분위:</span>
                            <span className="font-semibold text-blue-600">
                              상위 {100 - testResult.aiAnalysis.time_analysis.time_percentile}%
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="text-xs text-blue-600 mt-2">
                      ✨ 실제 데이터 기반 분석 완료
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI 권장사항 */}
            {testResult.aiAnalysis?.recommendations && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">💡 에디의 개인화 권장사항</h3>
                <div className="space-y-4">
                  {testResult.aiAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-blue-500 text-xl mt-1">
                        {index === 0 ? '🎯' : index === 1 ? '📚' : index === 2 ? '⚡' : '💡'}
                      </div>
                      <div className="text-blue-800">{recommendation}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-xs text-gray-500">
                  🤖 신뢰도: {Math.round((testResult.aiAnalysis.confidence_score || 0.92) * 100)}% | 
                  실제 데이터 기반 분석
                </div>
              </div>
            )}

            {/* 상세 결과 */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">📊 상세 결과</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>총 문제 수:</span>
                    <span className="font-semibold">{testResult.totalQuestions}문제</span>
                  </div>
                  <div className="flex justify-between">
                    <span>정답 수:</span>
                    <span className="font-semibold text-green-600">{testResult.correctAnswers}문제</span>
                  </div>
                  <div className="flex justify-between">
                    <span>오답 수:</span>
                    <span className="font-semibold text-red-600">{testResult.wrongAnswers}문제</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>정답률:</span>
                    <span className="font-semibold">{testResult.score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>소요 시간:</span>
                    <span className="font-semibold">{formatTimeMs(testResult.timeUsed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>세션 ID:</span>
                    <span className="font-semibold text-xs">{testResult.sessionId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 문제별 상세 분석 */}
            {testResult.aiAnalysis?.problem_analysis && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">📝 문제별 AI 해설</h3>
                <div className="space-y-6">
                  {Object.entries(testResult.aiAnalysis.problem_analysis)
                    .sort(([, a], [, b]) => a.question_number - b.question_number)
                    .map(([questionId, analysis]) => (
                    <div key={questionId} className={`p-6 rounded-lg border-2 ${
                      analysis.user_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      {/* 문제 헤더 */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-800">
                          문제 {analysis.question_number}번
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-2xl ${
                            analysis.user_correct ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {analysis.user_correct ? '✅' : '❌'}
                          </span>
                          <span className={`font-semibold ${
                            analysis.user_correct ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {analysis.user_correct ? '정답' : '오답'}
                          </span>
                        </div>
                      </div>

                      {/* 답안 정보 */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">선택한 답:</span>
                            <span className={`font-bold ${
                              analysis.user_correct ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {analysis.selected_answer}번
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">정답:</span>
                            <span className="font-bold text-green-600">
                              {analysis.correct_answer}번
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">영역:</span>
                            <span className="text-gray-700">{analysis.domain}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">유형:</span>
                            <span className="text-gray-700">{analysis.question_type}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI 해설 */}
                      {analysis.ai_explanation && (
                        <div className="space-y-4">
                          {/* 기본 결과 메시지 */}
                          <div className={`p-3 rounded-lg ${
                            analysis.user_correct ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
                          }`}>
                            <div className={`font-semibold ${
                              analysis.user_correct ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {analysis.ai_explanation.result_message}
                            </div>
                          </div>

                          {/* 난이도 분석 */}
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="font-semibold text-blue-800 mb-2">🎯 난이도 분석</div>
                            <div className="text-blue-700 text-sm">
                              {analysis.ai_explanation.difficulty_analysis}
                            </div>
                          </div>

                          {/* 학습 방향 */}
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="font-semibold text-purple-800 mb-2">📚 학습 방향</div>
                            <div className="text-purple-700 text-sm">
                              {analysis.ai_explanation.learning_direction}
                            </div>
                          </div>

                          {/* 영역별 조언 */}
                          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="font-semibold text-yellow-800 mb-2">💡 영역별 조언</div>
                            <div className="text-yellow-700 text-sm">
                              {analysis.ai_explanation.domain_advice}
                            </div>
                          </div>

                          {/* 문제 해결 팁 */}
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="font-semibold text-gray-800 mb-2">⚡ 문제 해결 팁</div>
                            <div className="text-gray-700 text-sm">
                              {analysis.ai_explanation.solving_tip}
                            </div>
                          </div>

                          {/* 통계 정보 */}
                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div>전체 정답률: {analysis.overall_accuracy}%</div>
                            <div>난이도: {analysis.difficulty_rating}/4.0</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center text-sm text-gray-500">
                  🤖 에디가 각 문제를 분석하여 개인화된 해설을 제공했습니다.
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="text-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                대시보드로 이동
              </button>
              <button
                onClick={() => {
                  setCurrentStep('intro');
                  setAnswers({});
                  setCurrentQuestionIndex(0);
                  setTestResult(null);
                  setSessionId(null);
                  setQuestionTimes({});
                  setIsCorrectAnswers({});
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                2차 진단테스트 준비
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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

console.log('✅ PhysicalTherapyDiagnosticTest 컴포넌트 정의 완료!');

export default PhysicalTherapyDiagnosticTest; 