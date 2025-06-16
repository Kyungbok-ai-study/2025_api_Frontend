import React from 'react';
import DiagnosticTestBase from '../DiagnosticTestBase';

const NursingDiagnosticTest = (props) => {
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
    department: '간호학과',
    displayName: '간호학과',
    subject: 'nursing',
    description: '간호학 기초 이론 및 임상 실무 능력 진단',
    fieldName: '간호학',
    questionCount: 30,
    timeLimit: 60,
    supportedDepartments: [
      '간호학과'
    ],
    objectives: [
      '간호학 기초 이론 지식 평가',
      '기본간호학 및 성인간호학 이해도 측정',
      '임상 실습 기초 능력 확인',
      '간호과정 적용 능력 진단',
      '전문 간호 윤리 의식 검증'
    ]
  };

  console.log('NursingDiagnosticTest 렌더링 시작');
  console.log('departmentConfig:', departmentConfig);
  console.log('userDepartment:', userDepartment);

  return (
    <DiagnosticTestBase 
      departmentConfig={departmentConfig} 
      userDepartment={userDepartment}
    />
  );
};

export default NursingDiagnosticTest; 