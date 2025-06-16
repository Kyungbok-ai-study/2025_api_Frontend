import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/api';

// 진단테스트 컴포넌트들 import
import ComputerScienceDiagnosticTest from './computer_science/ComputerScienceDiagnosticTest';
import PhysicalTherapyDiagnosticTest from './medical/PhysicalTherapyDiagnosticTest';
import NursingDiagnosticTest from './medical/NursingDiagnosticTest';
import OccupationalTherapyDiagnosticTest from './medical/OccupationalTherapyDiagnosticTest';
import EngineeringDiagnosticTest from './engineering/EngineeringDiagnosticTest';
import BusinessDiagnosticTest from './business/BusinessDiagnosticTest';
import UniversalDiagnosticTest from './UniversalDiagnosticTest';

// Import 디버깅
console.log('DiagnosticTestSelector - Import 확인:');
console.log('ComputerScienceDiagnosticTest:', ComputerScienceDiagnosticTest);
console.log('PhysicalTherapyDiagnosticTest:', PhysicalTherapyDiagnosticTest);
console.log('NursingDiagnosticTest:', NursingDiagnosticTest);
console.log('OccupationalTherapyDiagnosticTest:', OccupationalTherapyDiagnosticTest);
console.log('EngineeringDiagnosticTest:', EngineeringDiagnosticTest);
console.log('BusinessDiagnosticTest:', BusinessDiagnosticTest);
console.log('UniversalDiagnosticTest:', UniversalDiagnosticTest);

// 학과별 테스트 설정
const DEPARTMENT_TEST_CONFIGS = {
  '물리치료학과': {
    departmentName: '물리치료학과',
    testType: 'physical_therapy_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'physical_therapy_questions.json',
    emoji: '🏥',
    title: '1차 진단테스트',
    description: '물리치료사 국가고시 기출문제 기반 학생 수준 진단'
  },
  '간호학과': {
    departmentName: '간호학과',
    testType: 'nursing_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'nursing_questions.json',
    emoji: '👩‍⚕️',
    title: '1차 진단테스트',
    description: '간호사 국가고시 기출문제 기반 학생 수준 진단'
  },
  '의학과': {
    departmentName: '의학과',
    testType: 'medicine_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'medicine_questions.json',
    emoji: '👨‍⚕️',
    title: '1차 진단테스트',
    description: '의사 국가고시 기출문제 기반 학생 수준 진단'
  },
  '치의학과': {
    departmentName: '치의학과',
    testType: 'dentistry_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'dentistry_questions.json',
    emoji: '🦷',
    title: '1차 진단테스트',
    description: '치의사 국가고시 기출문제 기반 학생 수준 진단'
  },
  '한의학과': {
    departmentName: '한의학과',
    testType: 'oriental_medicine_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'oriental_medicine_questions.json',
    emoji: '🌿',
    title: '1차 진단테스트',
    description: '한의사 국가고시 기출문제 기반 학생 수준 진단'
  },
  '약학과': {
    departmentName: '약학과',
    testType: 'pharmacy_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'pharmacy_questions.json',
    emoji: '💊',
    title: '1차 진단테스트',
    description: '약사 국가고시 기출문제 기반 학생 수준 진단'
  },
  '수의학과': {
    departmentName: '수의학과',
    testType: 'veterinary_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'veterinary_questions.json',
    emoji: '🐕',
    title: '1차 진단테스트',
    description: '수의사 국가고시 기출문제 기반 학생 수준 진단'
  },
  '컴퓨터공학과': {
    departmentName: '컴퓨터공학과',
    testType: 'computer_science_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'computer_science_questions.json',
    emoji: '💻',
    title: '1차 진단테스트',
    description: '정보처리기사 등 IT 관련 시험 기반 학생 수준 진단'
  },
  '공학계열': {
    departmentName: '공학계열',
    testType: 'engineering_1st', 
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'engineering_questions.json',
    emoji: '⚙️',
    title: '1차 진단테스트',
    description: '공학 관련 자격증 시험 기반 학생 수준 진단'
  },
  '경영학과': {
    departmentName: '경영학과',
    testType: 'business_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'business_questions.json',
    emoji: '📊',
    title: '1차 진단테스트',
    description: '경영 관련 자격증 시험 기반 학생 수준 진단'
  },
  '법학과': {
    departmentName: '법학과',
    testType: 'law_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'law_questions.json',
    emoji: '⚖️',
    title: '1차 진단테스트',
    description: '사법고시/변호사시험 기반 학생 수준 진단'
  },
  '교육학과': {
    departmentName: '교육학과',
    testType: 'education_1st',
    totalQuestions: 30,
    timeLimit: 60,
    questionFile: 'education_questions.json',
    emoji: '📚',
    title: '1차 진단테스트',
    description: '교원임용고시 기반 학생 수준 진단'
  }
};

// 기본 설정 (알려지지 않은 학과용)
const DEFAULT_CONFIG = {
  departmentName: '일반학과',
  testType: 'general_1st',
  totalQuestions: 30,
  timeLimit: 60,
  questionFile: 'general_questions.json',
  emoji: '🎓',
  title: '1차 진단테스트',
  description: '일반 교양 문제 기반 학생 수준 진단'
};

const DiagnosticTestSelector = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      // 1. localStorage에서 사용자 정보 먼저 확인
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token) {
        navigate('/login');
        return;
      }

      let userData = null;

      if (storedUser) {
        userData = JSON.parse(storedUser);
        console.log('DiagnosticTestSelector - localStorage 사용자 정보:', userData);
      }

      // 2. API에서 최신 사용자 정보 가져오기 시도
      try {
        const response = await apiClient.get('/auth/me');
        userData = response.data;
        console.log('DiagnosticTestSelector - API 사용자 정보:', userData);
        
        // localStorage 업데이트
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (apiError) {
        console.error('API 호출 실패, localStorage 정보 사용:', apiError);
        
        // API 실패 시 기본 정보 사용 (테스트용)
        if (!userData) {
          userData = {
            id: 1,
            name: '테스트 사용자',
            department: '물리치료학과', // 테스트용 기본값
            email: 'test@example.com'
          };
        }
      }

      if (!userData || !userData.department) {
        setError('사용자 정보에 학과가 설정되지 않았습니다.');
        setLoading(false);
        return;
      }

      console.log('DiagnosticTestSelector - 최종 사용자 정보:', userData);
      console.log('DiagnosticTestSelector - 사용자 학과:', userData.department);
      
      setUser(userData);
      setLoading(false);
      
    } catch (err) {
      console.error('사용자 정보 가져오기 오류:', err);
      setError('사용자 정보를 불러오는데 실패했습니다.');
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
          <p className="mt-2 text-sm text-gray-500">사용자 정보를 확인하고 있습니다.</p>
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
        </div>
      </div>
    );
  }

  // 사용자 정보가 있는 경우 진단테스트 렌더링
  if (user && user.department) {
    console.log('🏫 DiagnosticTestSelector - 사용자 학과:', user.department);
    
    // 학과별 설정 가져오기 (없으면 기본 설정 사용)
    const testConfig = DEPARTMENT_TEST_CONFIGS[user.department] || {
      ...DEFAULT_CONFIG,
      departmentName: user.department
    };

    console.log('📋 DiagnosticTestSelector - 선택된 테스트 설정:', testConfig);

    // 🎯 **모든 학과에 범용 진단테스트 적용**
    return (
      <div className="diagnostic-test-container">
        <UniversalDiagnosticTest 
          userDepartment={user.department}
          testConfig={testConfig}
        />
        
        {/* 개발 환경 디버깅 정보 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm max-w-sm z-50">
            <div className="font-bold mb-2">🔧 개발자 정보</div>
            <div>사용자 학과: {user.department}</div>
            <div>테스트 타입: {testConfig.testType}</div>
            <div>문제 파일: {testConfig.questionFile}</div>
            <div>문제 수: {testConfig.totalQuestions}개</div>
            <div>제한 시간: {testConfig.timeLimit}분</div>
            <div>지원 학과 수: {Object.keys(DEPARTMENT_TEST_CONFIGS).length}개</div>
            <div className="mt-2 text-green-400">✅ 범용 시스템 활성화</div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default DiagnosticTestSelector; 