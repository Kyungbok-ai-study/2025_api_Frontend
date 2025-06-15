import React from 'react';
import DiagnosticTestBase from '../DiagnosticTestBase';

const NaturalScienceDiagnosticTest = () => {
  const departmentConfig = {
    department: '자연과학계열',
    displayName: '자연과학계열',
    subject: 'natural_science',
    description: '자연과학 기초 이론 및 응용 능력 진단',
    fieldName: '자연과학',
    questionCount: 35,
    timeLimit: 70,
    supportedDepartments: [
      '수학과',
      '물리학과',
      '화학과',
      '생물학과',
      '통계학과'
    ],
    objectives: [
      '수학 및 통계 기초 지식 평가',
      '물리/화학 기본 원리 이해도 측정',
      '실험 설계 및 데이터 분석 능력 확인',
      '과학적 사고 및 문제 해결 능력 검증',
      '연구 방법론 이해도 평가'
    ]
  };

  return <DiagnosticTestBase departmentConfig={departmentConfig} />;
};

export default NaturalScienceDiagnosticTest; 