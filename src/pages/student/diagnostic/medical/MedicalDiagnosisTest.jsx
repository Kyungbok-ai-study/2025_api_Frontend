import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../../services/api';

const MedicalDiagnosisTest = () => {
  const { department, round } = useParams();
  const navigate = useNavigate();
  
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60분 = 3600초
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // 컴포넌트 마운트 시 테스트 데이터 로드
  useEffect(() => {
    loadTestData();
  }, [department, round]);

  // 타이머 설정
  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmitTest(true); // 시간 초과로 자동 제출
    }
  }, [timeLeft, submitting]);

  // 테스트 데이터 로드
  const loadTestData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/diagnosis/progress/test-data/${department}/${round}`);
      setTestData(response.data);
      
      // 시간 제한 설정 (데이터에서 가져오거나 기본값 60분)
      const timeLimit = response.data.test_info?.time_limit_minutes || 60;
      setTimeLeft(timeLimit * 60);
      
      console.log(`${department} ${round}차 테스트 데이터 로드 완료:`, response.data);
    } catch (error) {
      console.error('테스트 데이터 로드 실패:', error);
      setError(error.response?.data?.detail || '테스트 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 답안 선택
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // 이전 문제
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // 다음 문제
  const handleNext = () => {
    if (currentQuestion < testData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // 특정 문제로 이동
  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  // 테스트 제출
  const handleSubmitTest = async (isAutoSubmit = false) => {
    if (submitting) return;

    const unansweredCount = testData.questions.length - Object.keys(answers).length;
    
    if (!isAutoSubmit && unansweredCount > 0) {
      if (!window.confirm(`${unansweredCount}개의 문제가 미답변 상태입니다. 정말 제출하시겠습니까?`)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      // 점수 계산
      let correctCount = 0;
      testData.questions.forEach(question => {
        const userAnswer = answers[question.question_id];
        if (userAnswer === question.correct_answer) {
          correctCount++;
        }
      });

      const score = (correctCount / testData.questions.length) * 100;
      const timeSpent = (testData.test_info?.time_limit_minutes || 60) * 60 - timeLeft;

      // 세션 ID 생성 (department 기반)
      const departmentCode = department === '물리치료학과' ? 'PT' : 'OT';
      const sessionId = `DIAG_${departmentCode}_R${round}_${Date.now()}`;

      // 성과 레벨 결정
      const level = score >= 90 ? '우수' : score >= 80 ? '상급' : score >= 65 ? '중급' : score >= 50 ? '하급' : '미흡';

      // 서버에 결과 전송
      const completeResponse = await apiClient.post('/diagnosis/progress/complete', {
        round_number: parseInt(round),
        score: score,
        time_spent: timeSpent,
        questions_correct: correctCount,
        questions_total: testData.questions.length,
        session_id: sessionId,
        level: level
      });

      console.log('테스트 완료 응답:', completeResponse.data);

      // 결과 페이지로 이동
      navigate('/student/diagnostic/medical', { 
        state: { 
          department,
          round: parseInt(round),
          score,
          level,
          correctCount,
          totalQuestions: testData.questions.length,
          timeSpent,
          isAutoSubmit,
          nextRound: completeResponse.data.next_available_round
        }
      });

    } catch (error) {
      console.error('테스트 제출 실패:', error);
      alert('테스트 제출에 실패했습니다: ' + (error.response?.data?.detail || error.message));
      setSubmitting(false);
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold mb-2">테스트 로딩 중...</h2>
          <p className="text-gray-600">{department} {round}차 진단테스트를 준비하고 있습니다.</p>
        </div>
      </div>
    );
  }

  // 오류 상태
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">테스트 로딩 실패</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => loadTestData()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
            <button
              onClick={() => navigate('/student/diagnostic/medical')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              뒤로 가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!testData || !testData.questions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-2">테스트 데이터 없음</h2>
          <p className="text-gray-600">테스트 문제를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const currentQuestionData = testData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / testData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {department} {round}차 진단테스트
              </h1>
              <p className="text-gray-600">
                {testData.test_info?.focus_area || '진단테스트'} - 문제 {currentQuestion + 1} / {testData.questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* 남은 시간 */}
              <div className={`text-xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
                ⏰ {formatTime(timeLeft)}
              </div>
              
              {/* 진행률 */}
              <div className="text-right">
                <div className="text-sm text-gray-600">진행률</div>
                <div className="text-lg font-bold text-green-600">{Math.round(progress)}%</div>
              </div>
            </div>
          </div>
          
          {/* 진행률 바 */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* 문제 영역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              
              {/* 문제 정보 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    문제 {currentQuestion + 1}
                  </span>
                  <span className="text-sm text-gray-500">
                    {currentQuestionData.difficulty_level} | {currentQuestionData.domain}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
                  {currentQuestionData.content}
                </h3>
              </div>

              {/* 선택지 */}
              <div className="space-y-3">
                {Object.entries(currentQuestionData.options).map(([key, value]) => (
                  <label
                    key={key}
                    className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                      answers[currentQuestionData.question_id] === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question_${currentQuestionData.question_id}`}
                        value={key}
                        checked={answers[currentQuestionData.question_id] === key}
                        onChange={() => handleAnswerChange(currentQuestionData.question_id, key)}
                        className="w-4 h-4 text-blue-600 mr-3"
                      />
                      <span className="text-gray-800">
                        <strong>{key}.</strong> {value}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* 네비게이션 버튼 */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    currentQuestion === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  ← 이전 문제
                </button>

                <div className="text-center">
                  <span className="text-gray-600">
                    {Object.keys(answers).length} / {testData.questions.length} 답변 완료
                  </span>
                </div>

                {currentQuestion === testData.questions.length - 1 ? (
                  <button
                    onClick={() => handleSubmitTest()}
                    disabled={submitting}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {submitting ? '제출 중...' : '테스트 완료'}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                  >
                    다음 문제 →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 사이드바 - 문제 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h4 className="text-lg font-semibold mb-4">문제 목록</h4>
              
              <div className="grid grid-cols-5 gap-2 mb-6">
                {testData.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      index === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[testData.questions[index].question_id]
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* 답변 현황 */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">답변 완료:</span>
                  <span className="font-medium text-green-600">
                    {Object.keys(answers).length}개
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">미답변:</span>
                  <span className="font-medium text-red-600">
                    {testData.questions.length - Object.keys(answers).length}개
                  </span>
                </div>
              </div>

              {/* 조기 제출 버튼 */}
              <button
                onClick={() => handleSubmitTest()}
                disabled={submitting}
                className={`w-full mt-6 px-4 py-3 rounded-lg font-medium transition-all ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700'
                } text-white`}
              >
                {submitting ? '제출 중...' : '조기 제출'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalDiagnosisTest; 