import React from 'react';
import DiagnosticTestBase from '../DiagnosticTestBase';

const PhysicalTherapyDiagnosticTest = () => {
  const departmentConfig = {
    department: '물리치료학과',
    displayName: '물리치료학과',
    subject: 'physical_therapy',
    description: '물리치료사 국가고시 기출문제 기반 학생 수준 진단',
    fieldName: '물리치료',
    questionCount: 30,
    timeLimit: 60,
    supportedDepartments: [
      '물리치료학과'
    ],
    objectives: [
      '물리치료학 기초 이론 지식 평가',
      '해부학 및 생리학 이해도 측정',
      '임상 실습 기초 능력 확인',
      '국가고시 준비 수준 진단',
      '전문 치료 기법 이해도 검증'
    ]
  };

  return <DiagnosticTestBase departmentConfig={departmentConfig} />;
};

export default PhysicalTherapyDiagnosticTest; 