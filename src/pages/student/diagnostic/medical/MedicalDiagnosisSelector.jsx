import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../../../services/api';
import ProgressBar from '../../../../components/ProgressBar';

const MedicalDiagnosisSelector = ({ userDepartment }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [diagnosisProgress, setDiagnosisProgress] = useState(null);
  const [availableRounds, setAvailableRounds] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const roundRefs = useRef({});

  // 지원되는 의료계열 학과
  const supportedDepartments = [
    {
      code: '물리치료학과',
      name: '물리치료학과',
      description: '물리치료사 국가고시 기반 진단테스트',
      icon: '🏃‍♂️',
      color: 'blue'
    },
    {
      code: '작업치료학과', 
      name: '작업치료학과',
      description: '작업치료사 국가고시 기반 진단테스트',
      icon: '🎨',
      color: 'green'
    }
  ];

  // 컴포넌트 마운트 시 사용자 학과로 초기화
  useEffect(() => {
    if (userDepartment && supportedDepartments.some(dept => dept.code === userDepartment)) {
      setSelectedDepartment(userDepartment);
      loadDepartmentData(userDepartment);
    }
  }, [userDepartment]);

  // 테스트 완료 결과 처리
  useEffect(() => {
    if (location.state) {
      const { department, round, score, level, correctCount, totalQuestions, timeSpent, isAutoSubmit, nextRound } = location.state;
      
      setTestResult({
        department,
        round,
        score,
        level,
        correctCount,
        totalQuestions,
        timeSpent,
        isAutoSubmit,
        nextRound
      });
      
      setSelectedDepartment(department);
      setShowResultModal(true);
      
      // state 초기화 (뒤로가기 시 다시 보이지 않도록)
      navigate(location.pathname, { replace: true });
      
      // 데이터 새로고침
      setTimeout(() => {
        loadDepartmentData(department);
      }, 1000);
    }
  }, [location.state]);

  // 차수 목록 불러온 뒤, max_available_round에 해당하는 차수 자동 선택 및 스크롤
  useEffect(() => {
    if (availableRounds.length > 0 && diagnosisProgress) {
      const nextRound = availableRounds.find(r => r.round_number === diagnosisProgress.max_available_round);
      if (nextRound) {
        setSelectedRound(nextRound.round_number);
        // 스크롤 처리
        setTimeout(() => {
          if (roundRefs.current[nextRound.round_number]) {
            roundRefs.current[nextRound.round_number].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [availableRounds, diagnosisProgress]);

  // 학과별 데이터 로드
  const loadDepartmentData = async (department) => {
    if (!department) return;
    
    setLoading(true);
    try {
      // 병렬로 데이터 로드
      const [progressResponse, roundsResponse, statsResponse] = await Promise.all([
        apiClient.get(`/diagnosis/progress/progress/${department}`),
        apiClient.get(`/diagnosis/progress/rounds/${department}`),
        apiClient.get(`/diagnosis/progress/statistics/${department}`)
      ]);

      setDiagnosisProgress(progressResponse.data);
      setAvailableRounds(roundsResponse.data);
      setStatistics(statsResponse.data);

      console.log('진단테스트 데이터 로드 완료:', {
        progress: progressResponse.data,
        rounds: roundsResponse.data,
        statistics: statsResponse.data
      });

    } catch (error) {
      console.error('데이터 로드 실패:', error);
      // 오류 시 기본값 설정
      setDiagnosisProgress({
        current_round: 0,
        max_available_round: 1,
        completed_rounds: [],
        total_tests_completed: 0,
        average_score: 0.0,
        completion_rate: 0.0
      });
      setAvailableRounds([]);
      setStatistics({
        completed_rounds: 0,
        completion_rate: 0.0,
        average_score: 0.0,
        best_score: 0.0
      });
    } finally {
      setLoading(false);
    }
  };

  // 학과 선택 변경
  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    setSelectedRound(null);
    loadDepartmentData(department);
  };

  // 차수별 상태 표시 함수
  const getRoundStatus = (round) => {
    if (round.is_completed) {
      return {
        status: 'completed',
        label: '완료',
        color: 'green',
        icon: '✅'
      };
    } else if (round.is_available) {
      return {
        status: 'available', 
        label: '응시 가능',
        color: 'blue',
        icon: '📝'
      };
    } else {
      return {
        status: 'locked',
        label: '잠금',
        color: 'gray',
        icon: '🔒'
      };
    }
  };

  // 테스트 시작
  const startTest = async (round) => {
    if (!round.is_available) {
      alert('이 차수는 아직 응시할 수 없습니다.');
      return;
    }

    try {
      // 테스트 데이터 유효성 확인
      const testDataResponse = await apiClient.get(`/diagnosis/progress/test-data/${selectedDepartment}/${round.round_number}`);
      
      if (testDataResponse.data) {
        // 테스트 시작 - 새로운 창에서 실행
        const testUrl = `/diagnosis/test/${selectedDepartment}/${round.round_number}`;
        navigate(testUrl);
      }
    } catch (error) {
      console.error('테스트 시작 실패:', error);
      alert('테스트를 시작할 수 없습니다: ' + (error.response?.data?.detail || error.message));
    }
  };

  // 진행률 계산
  const getProgressPercentage = () => {
    if (!diagnosisProgress) return 0;
    return diagnosisProgress.completion_rate * 100;
  };

  // 성과 레벨 계산
  const getPerformanceLevel = (score) => {
    if (score >= 90) return { label: '우수', color: 'purple' };
    if (score >= 80) return { label: '상급', color: 'blue' };
    if (score >= 65) return { label: '중급', color: 'green' };
    if (score >= 50) return { label: '하급', color: 'yellow' };
    return { label: '미흡', color: 'red' };
  };

  // 분석 결과 보기
  const viewAnalysisResult = () => {
    navigate(`/student/diagnosis/analysis/${selectedDepartment}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏥</div>
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
              의료계열 진단테스트
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              학과별 차수별 진단테스트 관리 시스템
            </p>
            <p className="text-sm text-gray-500">
              사용자 학과: {userDepartment || '정보 없음'}
            </p>
          </div>

          {/* 학과 선택 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">📚 학과 선택</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {supportedDepartments.map((dept) => (
                <div
                  key={dept.code}
                  onClick={() => handleDepartmentChange(dept.code)}
                  className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
                    selectedDepartment === dept.code
                      ? `border-${dept.color}-500 bg-${dept.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{dept.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold">{dept.name}</h3>
                      <p className="text-gray-600 text-sm">{dept.description}</p>
                      {selectedDepartment === dept.code && diagnosisProgress && (
                        <div className="mt-2">
                          <span className="text-sm text-blue-600 font-medium">
                            진행률: {Math.round(getProgressPercentage())}% 
                            ({diagnosisProgress.total_tests_completed}/10차 완료)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 로딩 상태 */}
          {loading && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">데이터 로딩 중...</p>
            </div>
          )}

          {/* 학과가 선택되고 로딩이 완료된 경우 */}
          {selectedDepartment && !loading && (
            <>
              {/* 전체 진행 상황 */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  📊 {selectedDepartment} 진행 상황
                </h2>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {diagnosisProgress?.total_tests_completed || 0}
                    </div>
                    <div className="text-gray-600">완료된 차수</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {Math.round(getProgressPercentage())}%
                    </div>
                    <div className="text-gray-600">전체 진행률</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round(statistics?.average_score || 0)}점
                    </div>
                    <div className="text-gray-600">평균 점수</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.round(statistics?.best_score || 0)}점
                    </div>
                    <div className="text-gray-600">최고 점수</div>
                  </div>
                </div>

                {/* 진행률 바 */}
                <ProgressBar
                  percentage={getProgressPercentage()}
                  label="전체 진행률"
                  showPercentage={true}
                  className="mt-6"
                />
              </div>

              {/* 차수별 테스트 목록 */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  📝 차수별 진단테스트 (1차~10차)
                </h2>
                
                <div className="grid gap-4">
                  {availableRounds.map((round) => {
                    const status = getRoundStatus(round);
                    const level = round.score ? getPerformanceLevel(round.score) : null;
                    
                    return (
                      <div
                        key={round.round_number}
                        ref={el => roundRefs.current[round.round_number] = el}
                        className={`border rounded-lg p-6 transition-all ${
                          round.round_number === selectedRound
                            ? 'border-blue-600 ring-2 ring-blue-300 bg-blue-50'
                            : status.status === 'completed' 
                              ? 'border-green-200 bg-green-50'
                              : status.status === 'available'
                                ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                                : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{status.icon}</span>
                              <div>
                                <h3 className="text-xl font-semibold">
                                  {round.round_number}차: {round.focus_area}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {round.description}
                                </p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <span className="text-sm text-gray-500">
                                    📝 {round.total_questions}문제
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    ⏰ {round.time_limit_minutes}분
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    status.color === 'green' ? 'bg-green-100 text-green-800' :
                                    status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {status.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            {/* 완료된 경우 점수 표시 */}
                            {round.is_completed && round.score && (
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {Math.round(round.score)}점
                                </div>
                                {level && (
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    level.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                    level.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                    level.color === 'green' ? 'bg-green-100 text-green-800' :
                                    level.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {level.label}
                                  </div>
                                )}
                                {round.completion_date && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(round.completion_date).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* 테스트 시작/재시험 버튼 */}
                            <button
                              onClick={() => startTest(round)}
                              disabled={!round.is_available}
                              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                round.is_available
                                  ? round.is_completed
                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {round.is_completed ? '재시험' : round.is_available ? '시작' : '잠김'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 다음 차수 안내 */}
                {diagnosisProgress && diagnosisProgress.max_available_round <= 10 && (
                  <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">💡</div>
                      <div>
                        <h4 className="font-semibold text-blue-800">다음 단계</h4>
                        <p className="text-blue-700 text-sm">
                          {diagnosisProgress.max_available_round > 10 
                            ? '모든 차수를 완료했습니다! 🎉'
                            : `${diagnosisProgress.max_available_round}차 진단테스트를 완료하면 다음 차수가 해제됩니다.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 뒤로가기 버튼 */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              ← 대시보드로 돌아가기
            </button>
          </div>
        </div>
      </div>

      {/* 테스트 완료 결과 모달 */}
      {showResultModal && testResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {testResult.level === '우수' ? '🎉' : 
                 testResult.level === '양호' ? '👏' : 
                 testResult.level === '보통' ? '💪' : '📚'}
              </div>
              
              <h3 className="text-2xl font-bold mb-2">
                {testResult.department} {testResult.round}차 완료!
              </h3>
              
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {testResult.score}점
              </div>
              
              <div className="text-lg text-gray-600 mb-4">
                {testResult.level} 수준
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                <div className="flex justify-between mb-2">
                  <span>정답 수:</span>
                  <span className="font-medium">{testResult.correctCount}/{testResult.totalQuestions}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>소요 시간:</span>
                  <span className="font-medium">{Math.round(testResult.timeSpent / 60)}분</span>
                </div>
                {testResult.isAutoSubmit && (
                  <div className="text-orange-600 text-xs mt-2">
                    ⏰ 시간 초과로 자동 제출되었습니다
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {/* 분석 결과 보기 버튼 */}
                <button
                  onClick={viewAnalysisResult}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  📊 상세 분석 결과 보기
                </button>
                
                {/* 다음 차수 버튼 */}
                {testResult.nextRound && (
                  <button
                    onClick={() => {
                      setShowResultModal(false);
                      setSelectedRound(testResult.nextRound);
                    }}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium"
                  >
                    🚀 {testResult.nextRound}차 진단테스트 시작
                  </button>
                )}
                
                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDiagnosisSelector; 