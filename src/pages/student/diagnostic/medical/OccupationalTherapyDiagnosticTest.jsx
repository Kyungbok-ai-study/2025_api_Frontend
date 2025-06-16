import React from 'react';
import DiagnosticTestBase from '../DiagnosticTestBase';

const OccupationalTherapyDiagnosticTest = (props) => {
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
    department: '작업치료학과',
    displayName: '작업치료학과',
    subject: 'occupational_therapy',
    description: '작업치료사 국가고시 기출문제 기반 학생 수준 진단',
    fieldName: '작업치료',
    questionCount: 30,
    timeLimit: 60,
    supportedDepartments: [
      '작업치료학과'
    ],
    objectives: [
      '작업치료학 기초 이론 지식 평가',
      '해부학 및 생리학 이해도 측정',
      '임상 실습 기초 능력 확인',
      '국가고시 준비 수준 진단',
      '전문 치료 기법 이해도 검증'
    ]
  };

  console.log('OccupationalTherapyDiagnosticTest 렌더링 시작');
  console.log('departmentConfig:', departmentConfig);
  console.log('userDepartment:', userDepartment);

  return (
    <DiagnosticTestBase 
      departmentConfig={departmentConfig} 
      userDepartment={userDepartment}
    />
  );
};

export default OccupationalTherapyDiagnosticTest; 