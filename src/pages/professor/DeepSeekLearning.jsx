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
  Database
} from 'lucide-react';

const DeepSeekLearning = () => {
  const [learningStats, setLearningStats] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testQuestion, setTestQuestion] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [manualLearningLoading, setManualLearningLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      
      // 병렬로 데이터 요청
      const [statsResponse, statusResponse] = await Promise.all([
        fetch('/api/professor/deepseek/learning-stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/professor/deepseek/model-status', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (statsResponse.ok && statusResponse.ok) {
        const statsData = await statsResponse.json();
        const statusData = await statusResponse.json();
        
        setLearningStats(statsData.deepseek_stats);
        setModelStatus(statusData.model_status);
      }
    } catch (error) {
      console.error('딥시크 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLearning = async () => {
    try {
      setManualLearningLoading(true);
      
      const response = await fetch('/api/professor/deepseek/manual-learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          limit: 20
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchLearningData(); // 데이터 새로고침
      } else {
        alert('수동 학습 실행 실패');
      }
    } catch (error) {
      console.error('수동 학습 실행 오류:', error);
      alert('수동 학습 실행 중 오류가 발생했습니다.');
    } finally {
      setManualLearningLoading(false);
    }
  };

  const handleTestKnowledge = async () => {
    if (!testQuestion.trim()) {
      alert('테스트 문제를 입력해주세요.');
      return;
    }

    try {
      setTestLoading(true);
      
      const response = await fetch('/api/professor/deepseek/test-knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          test_question: testQuestion
        })
      });

      if (response.ok) {
        const result = await response.json();
        setTestResult(result.test_result);
      } else {
        alert('지식 테스트 실행 실패');
      }
    } catch (error) {
      console.error('지식 테스트 오류:', error);
      alert('지식 테스트 중 오류가 발생했습니다.');
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">딥시크 학습 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">딥시크 AI 학습 관리</h1>
              <p className="text-gray-600">승인된 문제로부터 AI가 자동 학습하는 시스템</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={fetchLearningData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </button>
            
            <button
              onClick={handleManualLearning}
              disabled={manualLearningLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {manualLearningLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              수동 학습 실행
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 모델 상태 카드 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">모델 상태</h2>
              </div>
              {modelStatus?.model_available ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>

            {modelStatus && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">모델 상태:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    modelStatus.model_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {modelStatus.model_available ? '정상' : '연결 실패'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">모델명:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {modelStatus.model_name}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">서버 주소:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {modelStatus.ollama_host}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">테스트 결과:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    modelStatus.test_successful 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {modelStatus.test_successful ? '성공' : '실패'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">마지막 확인:</span>
                  <span className="text-sm text-gray-500">
                    {new Date(modelStatus.last_checked).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 학습 통계 카드 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">학습 통계</h2>
            </div>

            {learningStats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {learningStats.learning_stats?.total_learned || 0}
                    </div>
                    <div className="text-sm text-gray-600">총 학습 문제</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {learningStats.learning_stats?.learning_sessions?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">학습 세션</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">마지막 학습:</span>
                  <span className="text-sm text-gray-500">
                    {learningStats.learning_stats?.last_learning 
                      ? new Date(learningStats.learning_stats.last_learning).toLocaleString()
                      : '없음'
                    }
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">모델 버전:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {learningStats.learning_stats?.model_version || 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">시스템 상태:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    learningStats.system_status === 'operational'
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {learningStats.system_status === 'operational' ? '운영 중' : '대기'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 최근 학습 세션 */}
        {learningStats?.learning_stats?.learning_sessions?.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">최근 학습 세션</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">문제 ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">학과</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">과목</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">난이도</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">학습 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {learningStats.learning_stats.learning_sessions.slice(-10).reverse().map((session, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono">{session.question_id}</td>
                      <td className="py-3 px-4">{session.department}</td>
                      <td className="py-3 px-4">{session.subject || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          session.difficulty === '상' ? 'bg-red-100 text-red-800' :
                          session.difficulty === '중' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {session.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(session.learned_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 지식 테스트 */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">학습된 지식 테스트</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                테스트 문제
              </label>
              <textarea
                value={testQuestion}
                onChange={(e) => setTestQuestion(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="3"
                placeholder="딥시크가 학습한 지식을 테스트할 문제를 입력하세요..."
              />
            </div>
            
            <button
              onClick={handleTestKnowledge}
              disabled={testLoading || !testQuestion.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {testLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              지식 테스트 실행
            </button>
          </div>

          {testResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">AI 응답 결과:</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">성공 여부:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testResult.success ? '성공' : '실패'}
                  </span>
                </div>
                
                {testResult.ai_response && (
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">AI 응답:</span>
                    <div className="mt-2 p-3 bg-white border border-gray-200 rounded text-sm whitespace-pre-wrap">
                      {testResult.ai_response}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  테스트 시간: {testResult.tested_at ? new Date(testResult.tested_at).toLocaleString() : '-'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 학습 파일 정보 */}
        {learningStats?.file_stats && Object.keys(learningStats.file_stats).length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">학습 데이터 파일</h2>
            </div>

            <div className="space-y-3">
              {Object.entries(learningStats.file_stats).map(([filename, stats]) => (
                <div key={filename} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-mono text-sm">{filename}</div>
                    <div className="text-xs text-gray-500">
                      수정일: {new Date(stats.modified).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {(stats.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 시스템 가이드 */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">딥시크 학습 시스템 가이드</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🎯 자동 학습 플로우</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>1. 교수가 문제 승인</li>
                <li>2. QDRANT 벡터 DB 저장</li>
                <li>3. 딥시크 자동 학습 실행</li>
                <li>4. 실시간 컨텍스트 업데이트</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">⚡ 수동 작업</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 수동 학습 실행 (최대 20개 문제)</li>
                <li>• 학습된 지식 테스트</li>
                <li>• 모델 상태 확인</li>
                <li>• 학습 통계 모니터링</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepSeekLearning; 