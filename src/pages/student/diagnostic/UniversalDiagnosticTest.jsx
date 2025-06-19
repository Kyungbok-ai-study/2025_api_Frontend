import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../services/api';

const UniversalDiagnosticTest = () => {
  const navigate = useNavigate();
  const { department } = useParams();
  const [supportedDepartments, setSupportedDepartments] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState(department || '');
  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    loadSupportedDepartments();
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadTestInfo(selectedDepartment);
    }
  }, [selectedDepartment]);

  const loadUserInfo = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserInfo(user);
    
    // URL에서 학과가 지정되지 않았고, 사용자 학과가 있으면 자동 선택
    if (!department && user.department) {
      setSelectedDepartment(user.department);
    }
  };

  const loadSupportedDepartments = async () => {
    try {
      setLoading(true);
      
      // 사용자 본인 학과만 표시
      if (userInfo.department) {
        const userDepartmentCategory = getDepartmentCategory(userInfo.department);
        setSupportedDepartments({
          [userDepartmentCategory]: [userInfo.department]
        });
        setSelectedDepartment(userInfo.department); // 자동 선택
      } else {
        throw new Error('사용자 학과 정보를 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('지원 학과 목록 로드 실패:', error);
      setError(error.message || '학과 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentCategory = (department) => {
    const categoryMapping = {
      '의학과': '의료계열',
      '간호학과': '의료계열',
      '물리치료학과': '의료계열',
      '작업치료학과': '의료계열',
      '컴퓨터공학과': '컴퓨터계열',
      '소프트웨어공학과': '컴퓨터계열',
      '경영학과': '경영계열',
      '회계학과': '경영계열'
    };
    return categoryMapping[department] || '기타계열';
  };

  const loadTestInfo = async (departmentName) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/universal-diagnosis/department/${departmentName}/test-info`);
      
      if (response.data.success) {
        setTestInfo(response.data.data);
      } else {
        throw new Error('진단테스트 정보를 불러올 수 없습니다');
      }
    } catch (error) {
      console.error('테스트 정보 로드 실패:', error);
      setError(error.message || '테스트 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const startDiagnosisTest = async () => {
    if (!selectedDepartment) {
      alert('학과를 선택해주세요');
      return;
    }

    // 직접 테스트 실행 페이지로 이동
    navigate(`/student/universal-diagnosis/test/${selectedDepartment}`);
  };

  const getDepartmentIcon = (category) => {
    const icons = {
      '의료계열': '🏥',
      '공학계열': '⚙️',
      '컴퓨터계열': '💻',
      '자연과학계열': '🔬',
      '사회과학계열': '📊',
      '경영계열': '💼',
      '법학계열': '⚖️',
      '교육계열': '📚',
      '예술계열': '🎨'
    };
    return icons[category] || '📖';
  };

  const getCategoryColor = (category) => {
    const colors = {
      '의료계열': 'from-red-500 to-pink-500',
      '공학계열': 'from-blue-500 to-indigo-500',
      '컴퓨터계열': 'from-purple-500 to-blue-500',
      '자연과학계열': 'from-green-500 to-teal-500',
      '사회과학계열': 'from-yellow-500 to-orange-500',
      '경영계열': 'from-indigo-500 to-purple-500',
      '법학계열': 'from-gray-700 to-gray-900',
      '교육계열': 'from-emerald-500 to-green-500',
      '예술계열': 'from-pink-500 to-rose-500'
    };
    return colors[category] || 'from-gray-500 to-gray-700';
  };

  if (loading && !testInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">진단테스트 정보 로딩 중...</p>
            </div>
              </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
              <button
            onClick={() => window.location.reload()}
            className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
              >
            다시 시도
              </button>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                  <button
                onClick={() => navigate('/student/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 대시보드로 돌아가기
                  </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">전체 학과 진단테스트</h1>
            </div>
            
            {userInfo.name && (
              <div className="text-sm text-gray-600">
                {userInfo.name} ({userInfo.school} • {userInfo.department})
          </div>
                )}
              </div>
            </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 학과 선택 섹션 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            진단테스트를 받을 학과를 선택하세요
              </h2>
            
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(supportedDepartments).map(([category, departments]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className={`bg-gradient-to-r ${getCategoryColor(category)} p-4`}>
              <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getDepartmentIcon(category)}</span>
                    <h3 className="text-lg font-bold text-white">{category}</h3>
                </div>
              </div>
              
                <div className="p-4">
                  <div className="space-y-2">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setSelectedDepartment(dept)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedDepartment === dept
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
              </div>
              </div>
              </div>
            ))}
            </div>
              </div>

        {/* 선택된 학과 테스트 정보 */}
        {selectedDepartment && testInfo && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {testInfo.test_info.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {testInfo.test_info.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {testInfo.test_info.total_questions}
      </div>
                    <div className="text-sm text-gray-600">문제 수</div>
    </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {testInfo.test_info.time_limit}분
          </div>
                    <div className="text-sm text-gray-600">제한 시간</div>
            </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {testInfo.scoring_criteria.level_classification.중급.min_score}점
            </div>
                    <div className="text-sm text-gray-600">중급 기준</div>
            </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {testInfo.scoring_criteria.level_classification.상급.min_score}점
                    </div>
                    <div className="text-sm text-gray-600">상급 기준</div>
                  </div>
                    </div>
                    </div>
                  </div>
                  
            {/* 난이도별 배점 */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">난이도별 배점</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(testInfo.scoring_criteria.difficulty_weights).map(([level, weight]) => (
                  <div key={level} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-semibold text-gray-900">{level}</div>
                    <div className="text-sm text-gray-600">가중치 {weight}배</div>
                  </div>
                ))}
            </div>
          </div>

            {/* 등급별 기준 */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">등급별 기준</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(testInfo.scoring_criteria.level_classification).map(([level, criteria]) => (
                  <div key={level} className="p-3 border rounded-lg">
                    <div className="font-semibold text-gray-900">{level}</div>
                    <div className="text-sm text-indigo-600 font-medium">{criteria.min_score}점 이상</div>
                    <div className="text-xs text-gray-600 mt-1">{criteria.description}</div>
                      </div>
                ))}
              </div>
            </div>

            {/* 테스트 시작 버튼 */}
            <div className="flex justify-center">
                <button
                onClick={startDiagnosisTest}
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>시작 중...</span>
                  </div>
                ) : (
                  `${selectedDepartment} 진단테스트 시작`
                )}
                </button>
          </div>

            {/* 주의사항 */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-semibold text-yellow-800 mb-2">📋 테스트 안내사항</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 테스트는 한 번 시작하면 중단할 수 없습니다</li>
                <li>• 제한 시간 내에 모든 문제를 풀어주세요</li>
                <li>• 각 문제는 해당 학과의 전공 지식을 기반으로 출제됩니다</li>
                <li>• 테스트 완료 후 상세한 분석 결과를 확인할 수 있습니다</li>
                  </ul>
                </div>
                </div>
        )}

        {/* 선택된 학과가 없을 때 */}
        {!selectedDepartment && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              학과를 선택해주세요
                 </h3>
            <p className="text-gray-500">
              위에서 진단테스트를 받고 싶은 학과를 선택하시면<br />
              해당 학과의 상세 테스트 정보를 확인할 수 있습니다.
            </p>
                   </div>
                 )}
      </main>
    </div>
  );
};

export default UniversalDiagnosticTest; 