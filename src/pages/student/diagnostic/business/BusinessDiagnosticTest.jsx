import React from 'react';
import DiagnosticTestBase from '../DiagnosticTestBase';

const BusinessDiagnosticTest = (props) => {
  // props가 null이나 undefined인 경우를 안전하게 처리
  const safeProps = props || {};
  const { userDepartment } = safeProps;
  
  // DiagnosticTestBase가 제대로 import되었는지 확인
  if (!DiagnosticTestBase) {
    console.error('DiagnosticTestBase 컴포넌트를 불러올 수 없습니다.');
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">컴포넌트 로딩 오류</h2>
          <p className="text-red-500">DiagnosticTestBase 컴포넌트를 불러올 수 없습니다.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  const departmentConfig = {
    department: '경영학과',
    displayName: '경영학과',
    subject: 'business_administration',
    description: '경영학 이론 및 실무 능력 진단',
    fieldName: '경영학',
    questionCount: 30,
    timeLimit: 60,
    supportedDepartments: [
      '경영학과',
      '회계학과',
      '금융학과',
      '마케팅학과',
      '국제경영학과'
    ],
    objectives: [
      '경영학 기초 이론 지식 평가',
      '회계 및 재무 관리 능력 측정',
      '마케팅 및 전략 기획 능력 확인',
      '조직 관리 및 인사 관리 이해도 검증',
      '비즈니스 분석 및 의사결정 능력 평가'
    ]
  };

  console.log('BusinessDiagnosticTest 렌더링 시작');
  console.log('departmentConfig:', departmentConfig);
  console.log('userDepartment:', userDepartment);

  return (
    <DiagnosticTestBase 
      departmentConfig={departmentConfig} 
      userDepartment={userDepartment}
    />
  );
};

export default BusinessDiagnosticTest; 