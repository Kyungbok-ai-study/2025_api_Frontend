import React from 'react';
import DiagnosticTestBase from '../DiagnosticTestBase';

const EngineeringDiagnosticTest = (props) => {
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
    department: '공학계열',
    displayName: '공학계열',
    subject: 'engineering',
    description: '공학 기초 지식 및 응용 능력 진단',
    fieldName: '공학',
    questionCount: 35,
    timeLimit: 70,
    supportedDepartments: [
      '기계공학과',
      '전기공학과',
      '전자공학과',
      '화학공학과',
      '토목공학과',
      '건축학과'
    ],
    objectives: [
      '공학 수학 및 기초 과학 지식 평가',
      '전공 관련 이론 및 실무 능력 측정',
      '설계 및 문제 해결 능력 확인',
      '공학 윤리 및 안전 의식 검증',
      '현장 적용 능력 평가'
    ]
  };

  console.log('EngineeringDiagnosticTest 렌더링 시작');
  console.log('departmentConfig:', departmentConfig);
  console.log('userDepartment:', userDepartment);

  return (
    <DiagnosticTestBase 
      departmentConfig={departmentConfig} 
      userDepartment={userDepartment}
    />
  );
};

export default EngineeringDiagnosticTest; 