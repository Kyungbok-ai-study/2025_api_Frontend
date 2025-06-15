import React from 'react';
import DiagnosticTestBase from '../DiagnosticTestBase';

const BusinessDiagnosticTest = () => {
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

  return <DiagnosticTestBase departmentConfig={departmentConfig} />;
};

export default BusinessDiagnosticTest; 