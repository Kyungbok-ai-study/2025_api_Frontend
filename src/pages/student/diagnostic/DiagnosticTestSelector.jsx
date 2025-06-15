import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/api';

// 진단테스트 컴포넌트들 import
import ComputerScienceDiagnosticTest from './computer_science/ComputerScienceDiagnosticTest';
import PhysicalTherapyDiagnosticTest from './medical/PhysicalTherapyDiagnosticTest';
import EngineeringDiagnosticTest from './engineering/EngineeringDiagnosticTest';
import BusinessDiagnosticTest from './business/BusinessDiagnosticTest';

const DiagnosticTestSelector = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  // 학과별 진단테스트 매핑
  const departmentTestMapping = {
    // 컴퓨터공학 관련
    '컴퓨터공학과': { component: ComputerScienceDiagnosticTest, category: 'computer_science' },
    '소프트웨어융합과': { component: ComputerScienceDiagnosticTest, category: 'computer_science' },
    '정보시스템과': { component: ComputerScienceDiagnosticTest, category: 'computer_science' },
    '인공지능학과': { component: ComputerScienceDiagnosticTest, category: 'computer_science' },
    '데이터사이언스과': { component: ComputerScienceDiagnosticTest, category: 'computer_science' },
    
    // 의료 관련
    '물리치료학과': { component: PhysicalTherapyDiagnosticTest, category: 'medical' },
    '간호학과': { component: null, category: 'medical' }, // 추후 추가 예정
    '작업치료학과': { component: null, category: 'medical' },
    '방사선학과': { component: null, category: 'medical' },
    '임상병리학과': { component: null, category: 'medical' },
    
    // 공학 관련
    '기계공학과': { component: EngineeringDiagnosticTest, category: 'engineering' },
    '전기공학과': { component: EngineeringDiagnosticTest, category: 'engineering' },
    '전자공학과': { component: EngineeringDiagnosticTest, category: 'engineering' },
    '화학공학과': { component: EngineeringDiagnosticTest, category: 'engineering' },
    '토목공학과': { component: EngineeringDiagnosticTest, category: 'engineering' },
    '건축학과': { component: EngineeringDiagnosticTest, category: 'engineering' },
    
    // 경영/상경 관련
    '경영학과': { component: BusinessDiagnosticTest, category: 'business' },
    '회계학과': { component: BusinessDiagnosticTest, category: 'business' },
    '금융학과': { component: BusinessDiagnosticTest, category: 'business' },
    '마케팅학과': { component: BusinessDiagnosticTest, category: 'business' },
    '국제경영학과': { component: BusinessDiagnosticTest, category: 'business' },
    
    // 기타 (추후 추가 예정)
    '수학과': { component: null, category: 'natural_science' },
    '통계학과': { component: null, category: 'natural_science' },
    '영어학과': { component: null, category: 'language' },
    '국어국문학과': { component: null, category: 'language' }
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      // 임시: 테스트용 사용자 정보
      const testUser = {
        id: 1,
        name: '홍길동',
        department: '물리치료학과', // 테스트용 - 실제로는 다양한 학과 지원
        email: 'test@example.com'
      };
      
      setUser(testUser);
      selectDiagnosticTest(testUser);
      
      // 실제 구현
      /*
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiClient.get('/user/profile');
      const userData = response.data;
      setUser(userData);
      selectDiagnosticTest(userData);
      */
    } catch (err) {
      console.error('사용자 정보 가져오기 오류:', err);
      setError('사용자 정보를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const selectDiagnosticTest = (userData) => {
    if (!userData || !userData.department) {
      setError('학과 정보가 없습니다.');
      setLoading(false);
      return;
    }

    const testMapping = departmentTestMapping[userData.department];
    
    if (testMapping && testMapping.component) {
      setSelectedTest(testMapping.component);
      setLoading(false);
    } else if (testMapping && !testMapping.component) {
      setError(`${userData.department} 진단테스트는 현재 준비 중입니다. 곧 서비스될 예정입니다.`);
      setLoading(false);
    } else {
      setError(`${userData.department}는 현재 지원하지 않는 학과입니다.`);
      setLoading(false);
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">진단테스트 준비 중...</p>
          {user && (
            <p className="mt-2 text-sm text-gray-500">{user.department} 진단테스트를 로딩하고 있습니다.</p>
          )}
        </div>
      </div>
    );
  }

  // 에러 화면
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">진단테스트 안내</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          {user && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>{user.name}</strong>님의 학과: <strong>{user.department}</strong>
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/student')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              대시보드로 돌아가기
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              다시 시도
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>🔧 현재 지원 중인 학과:</p>
            <div className="grid grid-cols-2 gap-1 mt-2">
              <span>• 컴퓨터공학과</span>
              <span>• 물리치료학과</span>
              <span>• 기계공학과</span>
              <span>• 경영학과</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 진단테스트 컴포넌트 렌더링
  if (selectedTest) {
    const TestComponent = selectedTest;
    return <TestComponent userDepartment={user?.department} />;
  }

  return null;
};

export default DiagnosticTestSelector; 