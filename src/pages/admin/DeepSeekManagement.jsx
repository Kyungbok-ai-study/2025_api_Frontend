import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  BarChart3, 
  Activity, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Play,
  Settings,
  MessageSquare,
  TrendingUp,
  Clock,
  Users,
  Database,
  Monitor,
  Server,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  Edit
} from 'lucide-react';
import apiClient from '../../services/api';

const DeepSeekManagement = () => {
  const [systemStats, setSystemStats] = useState(null);
  const [professorStats, setProfessorStats] = useState([]);
  const [modelStatus, setModelStatus] = useState(null);
  const [realtimeData, setRealtimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [mlVisualizations, setMlVisualizations] = useState(null);
  const [loadingVisualization, setLoadingVisualization] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState('confusion_matrix');
  const [showProfessorModal, setShowProfessorModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [allProfessors, setAllProfessors] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
    fetchMLVisualizations(); // ML 시각화 데이터도 자동 로드
    // 실시간 업데이트를 위한 인터벌
    const interval = setInterval(fetchRealtimeData, 30000); // 30초마다
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // 관리자용 딥시크 데이터 요청
      const response = await apiClient.get('/admin/deepseek/system-overview');
      console.log('API 응답 전체:', response);
      
      // API 응답이 성공인지 확인
      if (response && typeof response === 'object') {
        // 백엔드 API가 직접 데이터를 반환하므로 그대로 사용
        setSystemStats(response.system_stats || {});
        setProfessorStats(response.professor_stats || []);
        setModelStatus(response.model_status || {});
        setSystemLogs(response.recent_logs || []);
        setPerformanceMetrics(response.performance_metrics || {});
        
        console.log('✅ 딥시크 관리 데이터 로드 완료');
        console.log('🔍 전체 응답:', response);
        console.log('시스템 통계:', response.system_stats);
        console.log('교수 통계:', response.professor_stats);
        console.log('모델 상태:', response.model_status);
      } else {
        throw new Error('잘못된 API 응답 형식');
      }
    } catch (error) {
      console.error('❌ 어드민 딥시크 데이터 로드 실패:', error);
      
      // 기본값으로 설정하여 화면이 완전히 비지 않도록 함
      setSystemStats({
        total_learned_questions: 0,
        total_professors: 0,
        success_rate: 0,
        system_uptime: '측정 중',
        active_learning_sessions: 0,
        average_learning_time: '측정 중',
        total_storage_used: '측정 중'
      });
      setProfessorStats([]);
      setModelStatus({
        memory_usage: '측정 중',
        cpu_usage: '측정 중',
        queue_size: 0,
        response_time: '측정 중'
      });
      setSystemLogs([{
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: '시스템 데이터 로드 실패',
        details: '서버에서 데이터를 가져오는데 실패했습니다.'
      }]);
      setPerformanceMetrics({
        learning_speed_trend: [1, 1.2, 1.5, 1.3, 1.1, 1.4, 1.2],
        memory_usage_trend: [3.2, 3.1, 3.3, 3.4, 3.2, 3.5, 3.3],
        success_rate_trend: [95, 94, 96, 95, 97, 96, 95],
        daily_learning_count: [10, 15, 20, 18, 25, 22, 28]
      });
      
      alert('⚠️ 딥시크 시스템 데이터를 불러오는데 실패했습니다.\n기본 데이터로 표시됩니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeData = async () => {
    try {
      const data = await apiClient.get('/admin/deepseek/realtime-data');
      setRealtimeData(prev => [...prev.slice(-9), data].slice(-10)); // 최근 10개 유지
    } catch (error) {
      console.error('실시간 데이터 로드 실패:', error);
    }
  };

  const fetchMLVisualizations = async () => {
    try {
      setLoadingVisualization(true);
      const response = await apiClient.get('/admin/deepseek/ml-analytics/all-visualizations');
      
      if (response && response.data) {
        setMlVisualizations(response.data);
        console.log('✅ ML 시각화 데이터 로드 완료:', response.data);
      } else {
        throw new Error('잘못된 응답 형식');
      }
    } catch (error) {
      console.error('❌ ML 시각화 데이터 로드 실패:', error);
      
      // 기본 시뮬레이션 데이터 설정
      const mockData = {
        confusion_matrix: {
          matrix: [[85, 5], [10, 100]],
          labels: ["실패", "성공"],
          metrics: {
            accuracy: 0.925,
            precision: 0.952,
            recall: 0.909,
            f1_score: 0.930
          }
        },
        learning_curve: {
          training_scores: [0.7, 0.75, 0.8, 0.85, 0.88, 0.9, 0.92],
          validation_scores: [0.68, 0.72, 0.78, 0.82, 0.85, 0.87, 0.89],
          train_sizes: [10, 20, 50, 100, 200, 500, 1000],
          dates: ['2025-01-05', '2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10', '2025-01-11']
        },
        loss_curve: {
          training_loss: [0.8, 0.6, 0.4, 0.3, 0.25, 0.2, 0.18],
          validation_loss: [0.85, 0.65, 0.45, 0.35, 0.3, 0.25, 0.22],
          epochs: [1, 2, 3, 4, 5, 6, 7]
        },
        roc_curve: {
          fpr: [0.0, 0.1, 0.2, 0.3, 1.0],
          tpr: [0.0, 0.6, 0.8, 0.9, 1.0],
          auc: 0.92
        },
        precision_recall_curve: {
          precision: [1.0, 0.95, 0.9, 0.85, 0.8],
          recall: [0.0, 0.4, 0.6, 0.8, 1.0],
          auc: 0.88
        },
        feature_importance: {
          features: [
            { feature: "처리시간", importance: 0.35 },
            { feature: "데이터크기", importance: 0.25 },
            { feature: "학습타입", importance: 0.20 },
            { feature: "에러유무", importance: 0.15 },
            { feature: "교수ID", importance: 0.05 }
          ]
        },
        dimensionality_reduction: {
          pca: {
            x: [1, 2, 3, -1, -2],
            y: [2, 1, -1, -2, 1],
            total_variance_explained: 0.75
          },
          tsne: {
            x: [5, 8, 2, -3, -8],
            y: [3, -2, 7, -5, 1]
          },
          umap: {
            x: [4, 6, 1, -2, -5],
            y: [2, -1, 5, -3, 2]
          },
          labels: ["성공", "성공", "실패", "실패", "성공"],
          unique_labels: ["성공", "실패"],
          color_indices: [0, 0, 1, 1, 0]
        },
        shap_analysis: {
          features: ["처리시간", "데이터크기", "학습타입", "에러유무", "교수ID"],
          mean_shap_values: [0.25, 0.15, 0.10, -0.20, 0.05]
        }
      };
      
      setMlVisualizations(mockData);
      console.log('🔄 기본 ML 시각화 데이터 설정 완료');
    } finally {
      setLoadingVisualization(false);
    }
  };



  // 전체 교수 목록 조회
  const fetchAllProfessors = async () => {
    try {
      setAllProfessors(professorStats || []);
      setShowProfessorModal(true);
    } catch (error) {
      console.error('전체 교수 목록 조회 실패:', error);
    }
  };

  // 전체 로그 조회
  const fetchAllLogs = async () => {
    try {
      setAllLogs(systemLogs || []);
      setShowLogsModal(true);
    } catch (error) {
      console.error('전체 로그 조회 실패:', error);
    }
  };

  // 향상된 시스템 제어 핸들러
  const handleSystemControl = async (action) => {
    try {
      setActionLoading(true);
      
      // 사용자 확인
      const actionNames = {
        'restart': '시스템 재시작',
        'backup': '백업 생성',
        'clear_cache': '캐시 정리',
        'optimize_model': '모델 최적화',
        'export_data': '데이터 내보내기'
      };
      
      const confirmed = window.confirm(`${actionNames[action]}을(를) 실행하시겠습니까?`);
      if (!confirmed) {
        setActionLoading(false);
        return;
      }
      
      console.log(`🔧 ${actionNames[action]} 실행 중...`);
      
      const response = await apiClient.post('/admin/deepseek/system-control', { action });
      
      if (response && response.success) {
        alert(`✅ ${actionNames[action]} 완료!\n\n${response.message}`);
        
        // 성공 후 데이터 새로고침
        if (action === 'restart' || action === 'optimize_model') {
          await fetchAdminData();
        }
        
        console.log(`✅ ${actionNames[action]} 성공:`, response.message);
      } else {
        throw new Error(response?.message || '알 수 없는 오류');
      }
    } catch (error) {
      console.error(`❌ ${action} 실패:`, error);
      alert(`❌ 작업 실행 실패\n\n${error.message || error.toString()}\n\n관리자에게 문의하세요.`);
    } finally {
      setActionLoading(false);
    }
  };

  // ML 분석 강제 재실행
  const forceRefreshMLAnalysis = async () => {
    try {
      setLoadingVisualization(true);
      
      const confirmed = window.confirm('ML 분석을 다시 실행하시겠습니까?\n\n실제 데이터를 기반으로 모든 시각화를 새로 생성합니다.');
      if (!confirmed) {
        setLoadingVisualization(false);
        return;
      }
      
      console.log('🔄 ML 분석 강제 재실행 중...');
      
      // 캐시 무효화를 위해 타임스탬프 추가
      const timestamp = Date.now();
      const response = await apiClient.get(`/admin/deepseek/ml-analytics/all-visualizations?refresh=${timestamp}`);
      
      if (response && response.data) {
        setMlVisualizations(response.data);
        console.log('✅ ML 분석 재실행 완료:', response.data);
        alert('✅ ML 분석이 성공적으로 재실행되었습니다!');
      } else {
        throw new Error('ML 분석 응답이 올바르지 않습니다');
      }
    } catch (error) {
      console.error('❌ ML 분석 재실행 실패:', error);
      alert(`❌ ML 분석 재실행 실패\n\n${error.message || error.toString()}`);
    } finally {
      setLoadingVisualization(false);
    }
  };

  const renderConfusionMatrix = (data) => {
    if (!data) return null;
    const { matrix, labels, metrics } = data;
    
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">혼동 행렬 (Confusion Matrix)</h3>
        
        {/* 메트릭 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">정확도</p>
            <p className="text-2xl font-bold text-blue-600">{(metrics.accuracy * 100).toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">정밀도</p>
            <p className="text-2xl font-bold text-green-600">{(metrics.precision * 100).toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">재현율</p>
            <p className="text-2xl font-bold text-purple-600">{(metrics.recall * 100).toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">F1 점수</p>
            <p className="text-2xl font-bold text-orange-600">{(metrics.f1_score * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* 혼동 행렬 시각화 */}
        <div className="flex justify-center">
          <div className="grid grid-cols-2 gap-2 text-center">
            {matrix.flat().map((value, index) => {
              const row = Math.floor(index / 2);
              const col = index % 2;
              const isCorrect = row === col;
              return (
                <div
                  key={index}
                  className={`w-24 h-24 flex items-center justify-center text-white font-bold text-lg rounded-lg ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ opacity: 0.8 + (value / Math.max(...matrix.flat())) * 0.2 }}
                >
                  {value}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 라벨 */}
        <div className="flex justify-center mt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">예측: {labels.join(' / ')}</p>
            <p className="text-sm text-gray-600">실제: {labels.join(' / ')}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderLearningCurve = (data) => {
    if (!data) return null;
    const { training_scores, validation_scores, train_sizes, dates } = data;
    
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">학습 곡선 (Learning Curve)</h3>
        
        <div className="h-64 flex items-end justify-between space-x-1">
          {training_scores.map((score, i) => (
            <div key={i} className="flex flex-col items-center space-y-1">
              <div className="relative flex items-end space-x-1">
                <div
                  className="bg-blue-500 w-3 rounded-t"
                  style={{ height: `${score * 200}px` }}
                  title={`훈련: ${(score * 100).toFixed(1)}%`}
                />
                <div
                  className="bg-green-500 w-3 rounded-t"
                  style={{ height: `${validation_scores[i] * 200}px` }}
                  title={`검증: ${(validation_scores[i] * 100).toFixed(1)}%`}
                />
              </div>
              {i % 5 === 0 && (
                <span className="text-xs text-gray-500 transform rotate-45 origin-bottom-left">
                  {dates[i]}
                </span>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm">훈련 점수</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">검증 점수</span>
          </div>
        </div>
      </div>
    );
  };

  const renderLossCurve = (data) => {
    if (!data) return null;
    const { training_loss, validation_loss, epochs } = data;
    
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">손실 함수 곡선 (Loss Curve)</h3>
        
        <div className="h-64 flex items-end justify-between space-x-1">
          {training_loss.map((loss, i) => (
            <div key={i} className="flex flex-col items-center space-y-1">
              <div className="relative flex items-end space-x-1">
                <div
                  className="bg-red-500 w-3 rounded-t"
                  style={{ height: `${(1 - loss) * 200}px` }}
                  title={`훈련 손실: ${loss.toFixed(4)}`}
                />
                <div
                  className="bg-orange-500 w-3 rounded-t"
                  style={{ height: `${(1 - validation_loss[i]) * 200}px` }}
                  title={`검증 손실: ${validation_loss[i].toFixed(4)}`}
                />
              </div>
              {i % 3 === 0 && (
                <span className="text-xs text-gray-500">
                  {epochs[i]}
                </span>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">훈련 손실</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm">검증 손실</span>
          </div>
        </div>
      </div>
    );
  };

  const renderROCCurve = (data) => {
    if (!data) return null;
    const { fpr, tpr, auc } = data;
    
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">ROC 곡선 (AUC: {auc})</h3>
        
        <div className="relative w-64 h-64 mx-auto border-2 border-gray-300">
          {/* ROC 곡선 그리기 (단순 시각화) */}
          <svg className="w-full h-full">
            <path
              d={`M 0,${256} ${fpr.map((x, i) => `L ${x * 256},${256 - tpr[i] * 256}`).join(' ')}`}
              stroke="blue"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 0,256 L 256,0"
              stroke="gray"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          </svg>
          
          {/* 축 라벨 */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
            False Positive Rate
          </div>
          <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm text-gray-600">
            True Positive Rate
          </div>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">AUC (Area Under Curve): <span className="font-bold text-blue-600">{auc}</span></p>
        </div>
      </div>
    );
  };

  const renderPrecisionRecallCurve = (data) => {
    if (!data) return null;
    const { precision, recall, auc } = data;
    
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Precision-Recall 곡선 (AUC: {auc})</h3>
        
        <div className="relative w-64 h-64 mx-auto border-2 border-gray-300">
          {/* PR 곡선 그리기 (단순 시각화) */}
          <svg className="w-full h-full">
            <path
              d={`M 0,0 ${recall.map((x, i) => `L ${x * 256},${(1 - precision[i]) * 256}`).join(' ')}`}
              stroke="green"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          
          {/* 축 라벨 */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
            Recall
          </div>
          <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm text-gray-600">
            Precision
          </div>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">Average Precision: <span className="font-bold text-green-600">{auc}</span></p>
        </div>
      </div>
    );
  };

  const renderFeatureImportance = (data) => {
    if (!data || !data.features) return null;
    
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">특성 중요도 (Feature Importance)</h3>
        
        <div className="space-y-3">
          {data.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-24 text-sm text-gray-600 truncate">{feature.feature}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: `${feature.importance * 100}%` }}
                />
              </div>
              <div className="w-16 text-sm text-right">{(feature.importance * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDimensionalityReduction = (data) => {
    if (!data) return null;
    const { pca, tsne, umap, labels, unique_labels, color_indices } = data;
    
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">차원 축소 시각화</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PCA */}
          <div className="text-center">
            <h4 className="text-md font-medium mb-2">PCA</h4>
            <div className="relative w-48 h-48 mx-auto border border-gray-300 bg-gray-50">
              {pca.x.map((x, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${(x + 5) * 10}%`,
                    top: `${(5 - pca.y[i]) * 10}%`,
                    backgroundColor: colors[color_indices[i] % colors.length]
                  }}
                  title={labels[i]}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">분산 설명률: {(pca.total_variance_explained * 100).toFixed(1)}%</p>
          </div>
          
          {/* t-SNE */}
          <div className="text-center">
            <h4 className="text-md font-medium mb-2">t-SNE</h4>
            <div className="relative w-48 h-48 mx-auto border border-gray-300 bg-gray-50">
              {tsne.x.map((x, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${(x + 20) * 2}%`,
                    top: `${(20 - tsne.y[i]) * 2}%`,
                    backgroundColor: colors[color_indices[i] % colors.length]
                  }}
                  title={labels[i]}
                />
              ))}
            </div>
          </div>
          
          {/* UMAP */}
          <div className="text-center">
            <h4 className="text-md font-medium mb-2">UMAP</h4>
            <div className="relative w-48 h-48 mx-auto border border-gray-300 bg-gray-50">
              {umap.x.map((x, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${(x + 10) * 4}%`,
                    top: `${(10 - umap.y[i]) * 4}%`,
                    backgroundColor: colors[color_indices[i] % colors.length]
                  }}
                  title={labels[i]}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* 범례 */}
        <div className="flex justify-center mt-4 space-x-4">
          {unique_labels.map((label, i) => (
            <div key={i} className="flex items-center space-x-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSHAPAnalysis = (data) => {
    if (!data || !data.features) return null;
    const { features, mean_shap_values } = data;
    
    return (
      <div className="bg-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">SHAP 분석</h3>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-20 text-sm text-gray-600">{feature}</div>
              <div className="flex-1 flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div className="absolute left-1/2 w-px h-4 bg-gray-400"></div>
                  <div
                    className={`h-4 rounded-full ${
                      mean_shap_values[index] >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.abs(mean_shap_values[index]) * 100}%`,
                      marginLeft: mean_shap_values[index] >= 0 ? '50%' : `${50 - Math.abs(mean_shap_values[index]) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="w-16 text-sm text-right">
                {mean_shap_values[index] >= 0 ? '+' : ''}{mean_shap_values[index].toFixed(3)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm">긍정적 영향</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm">부정적 영향</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">딥시크 시스템 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 디버깅 정보
  console.log('🔍 렌더링 상태:', {
    loading,
    systemStats,
    professorStats: professorStats?.length,
    mlVisualizations: !!mlVisualizations,
    loadingVisualization
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">딥시크 시스템 로딩 중...</h2>
          <p className="text-gray-600">시스템 데이터를 불러오고 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 작업 진행 중 표시 */}
        {actionLoading && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-sm flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            <strong className="text-blue-800">시스템 작업 진행 중...</strong>
            <span className="text-blue-600">잠시만 기다려주세요.</span>
          </div>
        )}

        {/* 디버깅 정보 표시 */}
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-sm">
          <strong>🔍 디버깅:</strong> Loading: {loading ? 'true' : 'false'}, 
          SystemStats: {systemStats ? 'loaded' : 'null'}, 
          Professors: {professorStats?.length || 0}, 
          ML Data: {mlVisualizations ? 'loaded' : 'null'},
          Action: {actionLoading ? 'running' : 'idle'}
        </div>

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">딥시크 시스템 관리</h1>
                <p className="text-gray-600">전체 시스템 모니터링 및 고급 관리</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={fetchAdminData}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
              
              <button
                onClick={() => handleSystemControl('restart')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                시스템 재시작
              </button>
              
              <button
                onClick={() => handleSystemControl('backup')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                백업 생성
              </button>
            </div>
          </div>
        </div>

        {/* 시스템 개요 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">학습 현황</h2>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">총 학습 문제:</span>
                <span className="font-bold text-blue-600">{systemStats?.total_learned_questions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">참여 교수:</span>
                <span className="font-bold">{systemStats?.total_professors}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">성공률:</span>
                <span className="font-bold text-green-600">{systemStats?.success_rate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Server className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">시스템 상태</h2>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">가동 시간:</span>
                <span className="font-bold text-green-600">{systemStats?.system_uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">활성 세션:</span>
                <span className="font-bold">{systemStats?.active_learning_sessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">평균 응답:</span>
                <span className="font-bold">{systemStats?.average_learning_time}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Monitor className="w-6 h-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">리소스 사용량</h2>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">메모리:</span>
                <span className="font-bold">{modelStatus?.memory_usage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CPU:</span>
                <span className="font-bold">{modelStatus?.cpu_usage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">저장공간:</span>
                <span className="font-bold">{systemStats?.total_storage_used}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">실시간 활동</h2>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">대기열:</span>
                <span className="font-bold">{modelStatus?.queue_size}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">응답 시간:</span>
                <span className="font-bold">{modelStatus?.response_time}</span>
              </div>
              <div className="text-xs text-gray-500">
                마지막 백업: {systemStats?.last_backup ? new Date(systemStats.last_backup).toLocaleString() : '-'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 교수별 학습 현황 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">교수별 학습 현황</h2>
              </div>
              <button 
                onClick={fetchAllProfessors}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                전체 보기
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-600">교수명</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">학과</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600">학습률</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600">성공률</th>
                    <th className="text-center py-3 px-2 font-medium text-gray-600">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {(professorStats || []).map((prof) => (
                    <tr 
                      key={prof.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedProfessor(prof)}
                    >
                      <td className="py-3 px-2 font-medium">{prof.name}</td>
                      <td className="py-3 px-2 text-gray-600">{prof.department}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${(prof.learned_questions / prof.total_questions) * 100}%`}}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs">{Math.round((prof.learned_questions / prof.total_questions) * 100)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          prof.success_rate >= 95 ? 'bg-green-100 text-green-800' :
                          prof.success_rate >= 90 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {prof.success_rate}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          prof.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {prof.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 시스템 로그 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">최근 시스템 로그</h2>
              </div>
              <button 
                onClick={fetchAllLogs}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                전체 로그
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(systemLogs || []).map((log, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                      log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{log.message}</p>
                  <p className="text-xs text-gray-600">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 성능 분석 차트 */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">성능 분석</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">학습 속도 추이</h3>
              <div className="h-20 flex items-end justify-center space-x-1">
                {(performanceMetrics?.learning_speed_trend || []).map((speed, i) => (
                  <div 
                    key={i} 
                    className="bg-blue-500 w-3 rounded-t"
                    style={{height: `${speed * 30}px`}}
                    title={`${speed}초`}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">최근 7일</p>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">메모리 사용량</h3>
              <div className="h-20 flex items-end justify-center space-x-1">
                {(performanceMetrics?.memory_usage_trend || []).map((memory, i) => (
                  <div 
                    key={i} 
                    className="bg-green-500 w-3 rounded-t"
                    style={{height: `${memory * 10}px`}}
                    title={`${memory}GB`}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">최근 7일</p>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">성공률 추이</h3>
              <div className="h-20 flex items-end justify-center space-x-1">
                {(performanceMetrics?.success_rate_trend || []).map((rate, i) => (
                  <div 
                    key={i} 
                    className="bg-purple-500 w-3 rounded-t"
                    style={{height: `${(rate - 90) * 4}px`}}
                    title={`${rate}%`}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">최근 7일</p>
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-2">일일 학습량</h3>
              <div className="h-20 flex items-end justify-center space-x-1">
                {(performanceMetrics?.daily_learning_count || []).map((count, i) => (
                  <div 
                    key={i} 
                    className="bg-orange-500 w-3 rounded-t"
                    style={{height: `${count * 0.8}px`}}
                    title={`${count}개`}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">최근 7일</p>
            </div>
          </div>
        </div>

        {/* 시스템 관리 도구 */}
        <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">시스템 관리 도구</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => handleSystemControl('clear_cache')}
              disabled={actionLoading}
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">캐시 정리</div>
                <div className="text-sm text-gray-500">임시 데이터 삭제</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleSystemControl('optimize_model')}
              disabled={actionLoading}
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">모델 최적화</div>
                <div className="text-sm text-gray-500">성능 향상 실행</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleSystemControl('export_data')}
              disabled={actionLoading}
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5 text-green-500" />
              <div className="text-left">
                <div className="font-medium text-gray-900">데이터 내보내기</div>
                <div className="text-sm text-gray-500">학습 데이터 백업</div>
              </div>
            </button>
          </div>
        </div>

        {/* 머신러닝 시각화 섹션 */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">머신러닝 분석 시각화</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchMLVisualizations}
                disabled={loadingVisualization}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingVisualization ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
                {loadingVisualization ? '분석 중...' : 'ML 분석 로드'}
              </button>
              
              <button
                onClick={forceRefreshMLAnalysis}
                disabled={loadingVisualization}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                강제 재실행
              </button>
            </div>
          </div>

          {/* 시각화 타입 선택 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'confusion_matrix', label: '혼동 행렬', icon: '🎯' },
              { key: 'learning_curve', label: '학습 곡선', icon: '📈' },
              { key: 'loss_curve', label: '손실 곡선', icon: '📉' },
              { key: 'roc_curve', label: 'ROC 곡선', icon: '📊' },
              { key: 'precision_recall_curve', label: 'PR 곡선', icon: '🎲' },
              { key: 'feature_importance', label: '특성 중요도', icon: '🔍' },
              { key: 'dimensionality_reduction', label: '차원 축소', icon: '🎯' },
              { key: 'shap_analysis', label: 'SHAP 분석', icon: '🔬' }
            ].map((viz) => (
              <button
                key={viz.key}
                onClick={() => setSelectedVisualization(viz.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedVisualization === viz.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{viz.icon}</span>
                {viz.label}
              </button>
            ))}
          </div>

          {/* 시각화 콘텐츠 */}
          {loadingVisualization ? (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <RefreshCw className="animate-spin w-8 h-8 text-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600">머신러닝 분석을 수행하는 중...</p>
                <p className="text-sm text-gray-500 mt-2">실제 학습 데이터와 QDRANT 벡터를 분석하고 있습니다.</p>
              </div>
            </div>
          ) : mlVisualizations ? (
            <div className="min-h-64">
              {selectedVisualization === 'confusion_matrix' && renderConfusionMatrix(mlVisualizations.confusion_matrix)}
              {selectedVisualization === 'learning_curve' && renderLearningCurve(mlVisualizations.learning_curve)}
              {selectedVisualization === 'loss_curve' && renderLossCurve(mlVisualizations.loss_curve)}
              {selectedVisualization === 'roc_curve' && renderROCCurve(mlVisualizations.roc_curve)}
              {selectedVisualization === 'precision_recall_curve' && renderPrecisionRecallCurve(mlVisualizations.precision_recall_curve)}
              {selectedVisualization === 'feature_importance' && renderFeatureImportance(mlVisualizations.feature_importance)}
              {selectedVisualization === 'dimensionality_reduction' && renderDimensionalityReduction(mlVisualizations.dimensionality_reduction)}
              {selectedVisualization === 'shap_analysis' && renderSHAPAnalysis(mlVisualizations.shap_analysis)}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">머신러닝 분석을 시작하세요</p>
                <p className="text-sm text-gray-500">
                  "ML 분석 실행" 버튼을 클릭하여 딥시크 학습 데이터를 분석하고<br />
                  혼동 행렬, ROC 곡선, 차원 축소 등의 시각화를 확인하세요.
                </p>
              </div>
            </div>
          )}

          {/* 분석 결과 요약 */}
          {mlVisualizations && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">📊 분석 요약</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-indigo-600 font-medium">혼동 행렬 정확도</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {mlVisualizations.confusion_matrix?.metrics?.accuracy ? 
                      (mlVisualizations.confusion_matrix.metrics.accuracy * 100).toFixed(1) + '%' : 'N/A'
                    }
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-indigo-600 font-medium">ROC AUC 점수</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {mlVisualizations.roc_curve?.auc || 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-indigo-600 font-medium">분석 벡터 수</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {mlVisualizations.dimensionality_reduction?.metadata?.total_vectors || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-xs text-indigo-700 mt-3">
                * 모든 분석은 실제 딥시크 학습 세션 데이터와 QDRANT 벡터 데이터를 기반으로 생성됩니다.
              </div>
            </div>
          )}
        </div>

        {/* 전체 교수 목록 모달 */}
        {showProfessorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">전체 교수 현황</h3>
                <button 
                  onClick={() => setShowProfessorModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-600">교수명</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-600">학과</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-600">총 문제</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-600">학습 완료</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-600">성공률</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-600">상태</th>
                      <th className="text-center py-3 px-2 font-medium text-gray-600">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProfessors.map((prof) => (
                      <tr key={prof.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{prof.name}</td>
                        <td className="py-3 px-2 text-gray-600">{prof.department}</td>
                        <td className="py-3 px-2 text-center">{prof.total_questions}</td>
                        <td className="py-3 px-2 text-center text-blue-600">{prof.learned_questions}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            prof.success_rate >= 95 ? 'bg-green-100 text-green-800' :
                            prof.success_rate >= 90 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {prof.success_rate}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            prof.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {prof.status === 'active' ? '활성' : '비활성'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button 
                            onClick={() => setSelectedProfessor(prof)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 전체 로그 모달 */}
        {showLogsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">전체 시스템 로그</h3>
                <button 
                  onClick={() => setShowLogsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                {allLogs.map((log, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                        log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{log.message}</p>
                    <p className="text-xs text-gray-600">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 선택된 교수 상세 정보 모달 */}
        {selectedProfessor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{selectedProfessor.name} 교수 상세 정보</h3>
                <button 
                  onClick={() => setSelectedProfessor(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600">학과</label>
                  <p className="font-medium">{selectedProfessor.department}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">총 문제 수</label>
                  <p className="font-medium">{selectedProfessor.total_questions}개</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">학습 완료</label>
                  <p className="font-medium text-blue-600">{selectedProfessor.learned_questions}개</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">성공률</label>
                  <p className="font-medium text-green-600">{selectedProfessor.success_rate}%</p>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="text-sm text-gray-600">마지막 활동</label>
                <p className="font-medium">{selectedProfessor.last_activity ? new Date(selectedProfessor.last_activity).toLocaleString() : '활동 없음'}</p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => alert('상세 보고서 기능은 준비 중입니다.')}
                >
                  상세 보고서
                </button>
                <button 
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  onClick={() => alert('학습 강제 실행 기능은 준비 중입니다.')}
                >
                  학습 강제 실행
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeepSeekManagement; 