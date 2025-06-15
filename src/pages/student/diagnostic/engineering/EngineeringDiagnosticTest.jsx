import React from 'react';
import DiagnosticTestBase from '../DiagnosticTestBase';

const EngineeringDiagnosticTest = () => {
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

  return <DiagnosticTestBase departmentConfig={departmentConfig} />;
};

export default EngineeringDiagnosticTest; 