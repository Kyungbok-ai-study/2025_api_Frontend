import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target, 
  Clock, 
  Brain,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Users,
  BookOpen,
  Lightbulb
} from 'lucide-react';

/**
 * 🎯 진단테스트 단계별 분석 결과 컴포넌트
 * 1차: 초기 진단 분석 (강점/약점, 학습 상태, 개인화 추천)
 * 2차~: 비교분석 및 학습추세 (성과 비교, 발전 추이, 약점 개선)
 */
const DiagnosisAnalysisResult = () => {
  const { department } = useParams();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalysisData();
  }, [department]);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/diagnosis/analysis/comprehensive/${department}`);
      setAnalysisData(response.data.data);
    } catch (error) {
      console.error('분석 데이터 로딩 실패:', error);
      setError(error.response?.data?.detail || '분석 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">분석 결과를 생성하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  const isInitialDiagnosis = analysisData?.analysis_type === 'initial_diagnosis';
  const isComparativeTrend = analysisData?.analysis_type === 'comparative_trend';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            돌아가기
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isInitialDiagnosis ? '🔍 초기 진단 분석' : '📈 학습 추세 분석'}
              </h1>
              <p className="text-gray-600 mt-2">
                {analysisData?.department} • {analysisData?.round_number}차 완료
                {isComparativeTrend && ` • 총 ${analysisData?.total_rounds_completed}차 진행`}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {analysisData?.performance_summary?.score || analysisData?.current_performance?.score}점
              </div>
              <div className="text-sm text-gray-500">
                {analysisData?.performance_summary?.performance_level || analysisData?.current_performance?.performance_level}
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: '전체 요약', icon: BarChart3 },
                { id: 'performance', name: isInitialDiagnosis ? '성과 분석' : '성과 비교', icon: Target },
                { id: 'trends', name: isInitialDiagnosis ? '영역별 분석' : '학습 추세', icon: TrendingUp },
                { id: 'recommendations', name: '학습 추천', icon: Lightbulb }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <OverviewSection analysisData={analysisData} isInitialDiagnosis={isInitialDiagnosis} />
          )}
          
          {activeTab === 'performance' && (
            <PerformanceSection analysisData={analysisData} isInitialDiagnosis={isInitialDiagnosis} />
          )}
          
          {activeTab === 'trends' && (
            <TrendsSection analysisData={analysisData} isInitialDiagnosis={isInitialDiagnosis} />
          )}
          
          {activeTab === 'recommendations' && (
            <RecommendationsSection analysisData={analysisData} isInitialDiagnosis={isInitialDiagnosis} />
          )}
        </div>
      </div>
    </div>
  );
};

// 전체 요약 섹션
const OverviewSection = ({ analysisData, isInitialDiagnosis }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 기본 성과 카드 */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <Award className="h-6 w-6 mr-2 text-yellow-500" />
          {isInitialDiagnosis ? '초기 진단 결과' : '현재 성과 요약'}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {analysisData?.performance_summary?.accuracy_rate || analysisData?.current_performance?.accuracy_rate}%
            </div>
            <div className="text-sm text-gray-600">정답률</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {analysisData?.performance_summary?.correct_answers || Math.round((analysisData?.current_performance?.accuracy_rate || 0) * 30 / 100)}
            </div>
            <div className="text-sm text-gray-600">정답 수</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {analysisData?.performance_summary?.time_spent_minutes || analysisData?.current_performance?.time_spent_minutes}분
            </div>
            <div className="text-sm text-gray-600">소요 시간</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {analysisData?.performance_summary?.performance_level || analysisData?.current_performance?.performance_level}
            </div>
            <div className="text-sm text-gray-600">수준</div>
          </div>
        </div>

        {/* 비교분석인 경우 추가 정보 */}
        {!isInitialDiagnosis && analysisData?.performance_comparison && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">📊 이전 차수와 비교</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className={`font-semibold ${
                  analysisData.performance_comparison.score_comparison.score_change > 0 ? 'text-green-600' : 
                  analysisData.performance_comparison.score_comparison.score_change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysisData.performance_comparison.score_comparison.score_change > 0 ? '+' : ''}
                  {analysisData.performance_comparison.score_comparison.score_change}점
                </div>
                <div className="text-gray-600">점수 변화</div>
              </div>
              
              <div className="text-center">
                <div className={`font-semibold ${
                  analysisData.performance_comparison.accuracy_comparison.accuracy_change > 0 ? 'text-green-600' : 
                  analysisData.performance_comparison.accuracy_comparison.accuracy_change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysisData.performance_comparison.accuracy_comparison.accuracy_change > 0 ? '+' : ''}
                  {analysisData.performance_comparison.accuracy_comparison.accuracy_change}%
                </div>
                <div className="text-gray-600">정답률 변화</div>
              </div>
              
              <div className="text-center">
                <div className={`font-semibold ${
                  analysisData.performance_comparison.time_comparison.time_change < 0 ? 'text-green-600' : 
                  analysisData.performance_comparison.time_comparison.time_change > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysisData.performance_comparison.time_comparison.time_change > 0 ? '+' : ''}
                  {analysisData.performance_comparison.time_comparison.time_change}초
                </div>
                <div className="text-gray-600">시간 변화</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 핵심 인사이트 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Brain className="h-6 w-6 mr-2 text-purple-500" />
          핵심 인사이트
        </h3>
        
        {isInitialDiagnosis ? (
          <div className="space-y-4">
            {/* 강점 영역 */}
            {analysisData?.learning_diagnosis?.strengths?.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">강점 영역</span>
                </div>
                <div className="text-sm text-green-700">
                  {analysisData.learning_diagnosis.strengths.join(', ')}
                </div>
              </div>
            )}
            
            {/* 약점 영역 */}
            {analysisData?.learning_diagnosis?.weaknesses?.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <span className="font-medium text-red-800">개선 필요 영역</span>
                </div>
                <div className="text-sm text-red-700">
                  {analysisData.learning_diagnosis.weaknesses.join(', ')}
                </div>
              </div>
            )}
            
            {/* 학습 스타일 */}
            {analysisData?.learning_diagnosis?.learning_style && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">학습 스타일</span>
                </div>
                <div className="text-sm text-blue-700">
                  {typeof analysisData.learning_diagnosis.learning_style === 'string' 
                    ? analysisData.learning_diagnosis.learning_style 
                    : '분석 중'}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* 학습 추세 */}
            {analysisData?.learning_trends && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">전체 추세</span>
                </div>
                <div className="text-sm text-blue-700">
                  점수: {analysisData.learning_trends.score_trend?.direction} • 
                  정확도: {analysisData.learning_trends.accuracy_trend?.direction}
                </div>
              </div>
            )}
            
            {/* 약점 개선 */}
            {analysisData?.weakness_improvement?.summary && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Target className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">약점 개선</span>
                </div>
                <div className="text-sm text-green-700">
                  {analysisData.weakness_improvement.summary.overcome_weaknesses}개 영역 개선 완료 
                  (총 {analysisData.weakness_improvement.summary.total_weaknesses}개 중)
                </div>
              </div>
            )}
            
            {/* 동료 비교 */}
            {analysisData?.peer_comparison && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="font-medium text-purple-800">동료 비교</span>
                </div>
                <div className="text-sm text-purple-700">
                  상위 {analysisData.peer_comparison.percentile}% • 
                  평균 대비 {analysisData.peer_comparison.performance_vs_average > 0 ? '+' : ''}
                  {analysisData.peer_comparison.performance_vs_average}점
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 성과 분석/비교 섹션
const PerformanceSection = ({ analysisData, isInitialDiagnosis }) => {
  return (
    <div className="space-y-8">
      {isInitialDiagnosis ? (
        <InitialPerformanceAnalysis analysisData={analysisData} />
      ) : (
        <ComparativePerformanceAnalysis analysisData={analysisData} />
      )}
    </div>
  );
};

// 추세/영역별 분석 섹션
const TrendsSection = ({ analysisData, isInitialDiagnosis }) => {
  return (
    <div className="space-y-8">
      {isInitialDiagnosis ? (
        <DomainAnalysis analysisData={analysisData} />
      ) : (
        <LearningTrendsAnalysis analysisData={analysisData} />
      )}
    </div>
  );
};

// 학습 추천 섹션
const RecommendationsSection = ({ analysisData, isInitialDiagnosis }) => {
  const recommendations = isInitialDiagnosis 
    ? analysisData?.personalized_recommendations 
    : analysisData?.personalized_recommendations;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-6 flex items-center">
        <Lightbulb className="h-6 w-6 mr-2 text-yellow-500" />
        개인화된 학습 추천
      </h3>
      
      {recommendations ? (
        <div className="space-y-4">
          {Array.isArray(recommendations) ? (
            recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-blue-800">{rec}</p>
              </div>
            ))
          ) : (
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-blue-800">개인화된 학습 추천을 생성하고 있습니다...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          학습 추천 데이터를 불러오는 중입니다...
        </div>
      )}
    </div>
  );
};

// 초기 성과 분석 컴포넌트
const InitialPerformanceAnalysis = ({ analysisData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 영역별 성과 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">📚 영역별 성과</h3>
        <div className="space-y-4">
          {analysisData?.domain_analysis && Object.entries(analysisData.domain_analysis).map(([domain, analysis]) => (
            <div key={domain} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{domain}</div>
                <div className="text-sm text-gray-600">
                  {analysis.correct_count}/{analysis.questions_count} 문제
                </div>
              </div>
              <div className="text-right">
                <div className={`font-semibold ${
                  analysis.is_strength ? 'text-green-600' : 
                  analysis.is_weakness ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {analysis.accuracy_rate}%
                </div>
                <div className="text-xs text-gray-500">{analysis.performance_level}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 난이도별 성과 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">⚡ 난이도별 성과</h3>
        <div className="space-y-4">
          {analysisData?.difficulty_analysis && Object.entries(analysisData.difficulty_analysis).map(([level, analysis]) => {
            const levelNames = { easy: '쉬움', medium: '보통', hard: '어려움' };
            const levelColors = { easy: 'green', medium: 'yellow', hard: 'red' };
            const color = levelColors[level];
            
            return (
              <div key={level} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{levelNames[level]}</div>
                  <div className="text-sm text-gray-600">
                    {analysis.correct_count}/{analysis.questions_count} 문제
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold text-${color}-600`}>
                    {analysis.accuracy_rate}%
                  </div>
                  <div className="text-xs text-gray-500">{analysis.performance_level}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 비교 성과 분석 컴포넌트
const ComparativePerformanceAnalysis = ({ analysisData }) => {
  return (
    <div className="space-y-6">
      {/* 성과 비교 차트 영역 - 실제 차트 라이브러리 사용 시 구현 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">📈 성과 추이</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">차트 라이브러리 연동 예정</p>
        </div>
      </div>
    </div>
  );
};

// 영역별 분석 컴포넌트
const DomainAnalysis = ({ analysisData }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">🎯 영역별 상세 분석</h3>
      {/* 영역별 분석 내용 */}
    </div>
  );
};

// 학습 추세 분석 컴포넌트
const LearningTrendsAnalysis = ({ analysisData }) => {
  return (
    <div className="space-y-6">
      {/* 학습 추세 내용 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">📊 학습 추세 분석</h3>
        {/* 추세 분석 내용 */}
      </div>
    </div>
  );
};

export default DiagnosisAnalysisResult; 