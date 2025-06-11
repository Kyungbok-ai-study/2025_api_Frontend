import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  BarElement,
  ArcElement
} from 'chart.js';
import { Line, Radar, Bar, Doughnut } from 'react-chartjs-2';

// Chart.js 구성 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  BarElement,
  ArcElement
);

const LearningAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL에서 testSessionId 추출
  const getTestSessionId = () => {
    const pathParts = location.pathname.split('/');
    const testIdFromPath = pathParts[pathParts.length - 1];
    return location.state?.testSessionId || testIdFromPath;
  };

  useEffect(() => {
    fetchDetailedAnalysis();
  }, []);

  const fetchDetailedAnalysis = async () => {
    try {
      setLoading(true);
      const testSessionId = getTestSessionId();
      
      if (!testSessionId) {
        throw new Error('테스트 세션 ID를 찾을 수 없습니다.');
      }

      console.log('Fetching detailed analysis for test session:', testSessionId);
      const response = await apiClient.get(`/diagnosis/result/${testSessionId}/detailed`);
      setAnalysisData(response.data);
    } catch (err) {
      console.error('상세 분석 조회 실패:', err);
      setError(err.response?.data?.detail || err.message || '분석 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  const getLevelColor = (level) => {
    if (level >= 0.8) return 'text-green-600';
    if (level >= 0.6) return 'text-blue-600';
    if (level >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMasteryColor = (mastery) => {
    const colors = {
      'expert': 'bg-green-100 text-green-800',
      'proficient': 'bg-blue-100 text-blue-800',
      'developing': 'bg-yellow-100 text-yellow-800',
      'beginner': 'bg-red-100 text-red-800'
    };
    return colors[mastery] || 'bg-gray-100 text-gray-800';
  };

  const getMasteryLabel = (mastery) => {
    const labels = {
      'expert': '전문가',
      'proficient': '숙련자',
      'developing': '발전중',
      'beginner': '초보자'
    };
    return labels[mastery] || '미분류';
  };

  const renderOverview = () => {
    if (!analysisData) return null;
    
    const { basic_result, relative_position, click_pattern_analysis, time_pattern_analysis } = analysisData;
    
    return (
      <div className="space-y-6">
        {/* 종합 점수 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">학습 수준</h3>
            <div className={`text-3xl font-bold ${getLevelColor(basic_result.learning_level)}`}>
              {(basic_result.learning_level * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              등급: {relative_position?.level_grade}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">정답률</h3>
            <div className="text-3xl font-bold text-blue-600">
              {(basic_result.accuracy_rate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {basic_result.correct_answers}/{basic_result.total_questions} 문제
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">상대적 위치</h3>
            <div className="text-3xl font-bold text-purple-600">
              {relative_position?.percentile}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              상위 {(100 - relative_position?.percentile).toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">총 소요시간</h3>
            <div className="text-3xl font-bold text-orange-600">
              {formatTime(basic_result.total_time_spent)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              평균 {Math.round(basic_result.total_time_spent / basic_result.total_questions)}초/문제
            </div>
          </div>
        </div>

        {/* 학습 패턴 분석 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">학습 패턴 분석</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">응답 패턴</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>응답 스타일:</span>
                  <span className={`font-semibold ${click_pattern_analysis?.response_pattern === 'careful' ? 'text-blue-600' : 'text-orange-600'}`}>
                    {click_pattern_analysis?.response_pattern === 'careful' ? '신중형' : '즉흥형'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>평균 응답시간:</span>
                  <span>{click_pattern_analysis?.avg_response_time}초</span>
                </div>
                <div className="flex justify-between">
                  <span>시간 일관성:</span>
                  <span>{(click_pattern_analysis?.time_consistency * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">피로도 분석</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>피로도 감지:</span>
                  <span className={`font-semibold ${time_pattern_analysis?.fatigue_indicator?.detected ? 'text-red-600' : 'text-green-600'}`}>
                    {time_pattern_analysis?.fatigue_indicator?.detected ? '감지됨' : '정상'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>시간 트렌드:</span>
                  <span>{time_pattern_analysis?.time_trend === 'consistent' ? '일정함' : 
                         time_pattern_analysis?.time_trend === 'slowing_down' ? '느려짐' : '빨라짐'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConceptAnalysis = () => {
    if (!analysisData?.concept_understanding) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">개념별 이해도</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(analysisData.concept_understanding).map(([concept, data]) => (
              <div key={concept} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-700">{concept}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getMasteryColor(data.mastery_level)}`}>
                    {getMasteryLabel(data.mastery_level)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>이해도:</span>
                    <span className="font-semibold">{(data.understanding_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${data.understanding_rate * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>정답률:</span>
                    <span>{(data.accuracy_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>문제 수:</span>
                    <span>{data.total_questions}개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>평균 시간:</span>
                    <span>{Math.round(data.avg_time)}초</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionLog = () => {
    if (!analysisData?.question_analysis) return null;
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">문항별 상세 로그</h3>
          <div className="space-y-4">
            {analysisData.question_analysis.map((question, index) => (
              <div key={question.question_id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-700">문제 {index + 1}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${question.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {question.is_correct ? '정답' : '오답'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      난이도 {question.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  {question.question_content}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">영역:</span>
                    <div className="text-gray-600">{question.subject_area}</div>
                  </div>
                  <div>
                    <span className="font-medium">소요시간:</span>
                    <div className="text-gray-600">{question.time_spent}초</div>
                  </div>
                  <div>
                    <span className="font-medium">획득점수:</span>
                    <div className="text-gray-600">{question.score.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="font-medium">개념태그:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {question.concept_tags?.map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {!question.is_correct && (
                  <div className="mt-3 p-3 bg-red-50 rounded border">
                    <div className="text-sm">
                      <span className="font-medium text-red-700">정답: </span>
                      <span className="text-red-600">{question.correct_answer}</span>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium text-red-700">내 답안: </span>
                      <span className="text-red-600">{question.user_answer}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

      const renderVisualization = () => {
        if (!analysisData?.visual_data) return null;
        
        const { learning_radar, performance_trend, knowledge_map } = analysisData.visual_data;
        
        // 레이더 차트 설정
        const radarOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '개념별 이해도 분석'
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        };

        // 성과 트렌드 차트 설정
        const trendOptions = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: '문제 구간'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '정답률 (%)'
                    },
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: '소요시간 (초)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
        };

        // 개념별 이해도 도넛 차트 데이터
        const conceptData = analysisData.concept_understanding ? Object.entries(analysisData.concept_understanding) : [];
        const doughnutData = {
            labels: conceptData.map(([concept]) => concept),
            datasets: [
                {
                    data: conceptData.map(([_, data]) => data.understanding_rate * 100),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                        '#FF6384',
                        '#C9CBCF'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }
            ]
        };

        const doughnutOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: '개념별 이해도 분포'
                }
            }
        };
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 학습 레이더 차트 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">학습 레이더 차트</h3>
                        <div className="h-80">
                            {learning_radar?.categories?.length > 0 ? (
                                <Radar data={learning_radar} options={radarOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    분석할 데이터가 충분하지 않습니다.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 개념별 이해도 도넛 차트 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">개념별 이해도 분포</h3>
                        <div className="h-80">
                            {conceptData.length > 0 ? (
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    분석할 데이터가 충분하지 않습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 성과 트렌드 차트 */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">성과 트렌드 분석</h3>
                    <div className="h-80">
                        {performance_trend?.labels?.length > 0 ? (
                            <Line data={performance_trend} options={trendOptions} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                분석할 데이터가 충분하지 않습니다.
                            </div>
                        )}
                    </div>
                </div>

                {/* 지식 맵 */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">지식 맵</h3>
                    {knowledge_map?.nodes?.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {knowledge_map.nodes.map((node, index) => (
                                <div key={index} className="border rounded-lg p-4 text-center hover:shadow-lg transition-shadow">
                                    <div 
                                        className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                                        style={{ backgroundColor: node.color }}
                                    >
                                        {Math.round(node.value)}
                                    </div>
                                    <div className="text-sm font-medium text-gray-800 mb-1">{node.label}</div>
                                    <div className="text-xs text-gray-500 mb-2">{getMasteryLabel(node.mastery)}</div>
                                    <div className="text-xs text-gray-400">
                                        문제 {node.questions}개 | 정확도 {(node.accuracy * 100).toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-32 flex items-center justify-center text-gray-500">
                            분석할 데이터가 충분하지 않습니다.
                        </div>
                    )}
                </div>

                {/* 난이도별 성과 분석 */}
                {analysisData.difficulty_performance && Object.keys(analysisData.difficulty_performance).length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">난이도별 성과 분석</h3>
                        <div className="h-64">
                            <Bar 
                                data={{
                                    labels: Object.keys(analysisData.difficulty_performance),
                                    datasets: [
                                        {
                                            label: '정답률 (%)',
                                            data: Object.values(analysisData.difficulty_performance).map(d => d.accuracy_rate * 100),
                                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                                            borderColor: 'rgba(54, 162, 235, 1)',
                                            borderWidth: 1
                                        },
                                        {
                                            label: '평균 시간 (초)',
                                            data: Object.values(analysisData.difficulty_performance).map(d => d.avg_time),
                                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                                            borderColor: 'rgba(255, 99, 132, 1)',
                                            borderWidth: 1,
                                            yAxisID: 'y1'
                                        }
                                    ]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            type: 'linear',
                                            display: true,
                                            position: 'left',
                                            title: {
                                                display: true,
                                                text: '정답률 (%)'
                                            },
                                        },
                                        y1: {
                                            type: 'linear',
                                            display: true,
                                            position: 'right',
                                            title: {
                                                display: true,
                                                text: '소요시간 (초)'
                                            },
                                            grid: {
                                                drawOnChartArea: false,
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

  const renderPeerComparison = () => {
    if (!analysisData?.relative_position?.peer_comparison) return null;
    
    const peer = analysisData.relative_position.peer_comparison;
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">동료 비교 분석</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">정확도 비교</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>내 정확도:</span>
                  <span className="font-semibold">{(peer.your_accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>동료 평균:</span>
                  <span>{(peer.peer_avg_accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>비교 결과:</span>
                  <span className={`font-semibold ${peer.accuracy_compared_to_peers === 'above' ? 'text-green-600' : 'text-red-600'}`}>
                    {peer.accuracy_compared_to_peers === 'above' ? '평균 이상' : '평균 이하'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">시간 비교</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>내 소요시간:</span>
                  <span className="font-semibold">{formatTime(peer.your_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span>동료 평균:</span>
                  <span>{formatTime(Math.round(peer.peer_avg_time))}</span>
                </div>
                <div className="flex justify-between">
                  <span>비교 결과:</span>
                  <span className={`font-semibold ${peer.time_compared_to_peers === 'faster' ? 'text-green-600' : 'text-orange-600'}`}>
                    {peer.time_compared_to_peers === 'faster' ? '더 빠름' : '더 느림'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded border">
            <div className="text-sm text-blue-700">
              <strong>동료 그룹:</strong> 비슷한 수준의 학습자 {peer.similar_peers}명과 비교한 결과입니다.
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">상세 분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ 오류 발생</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={fetchDetailedAnalysis}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              대시보드로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">학습 분석 리포트</h1>
          <p className="text-gray-600 mt-2">진단테스트 결과에 대한 상세한 분석입니다</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: '종합 분석' },
              { id: 'concepts', label: '개념별 이해도' },
              { id: 'questions', label: '문항별 로그' },
              { id: 'visual', label: '시각화' },
              { id: 'comparison', label: '동료 비교' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'concepts' && renderConceptAnalysis()}
        {activeTab === 'questions' && renderQuestionLog()}
        {activeTab === 'visual' && renderVisualization()}
        {activeTab === 'comparison' && renderPeerComparison()}

        {/* 하단 액션 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningAnalysis; 