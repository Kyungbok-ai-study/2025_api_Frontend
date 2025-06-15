import React from 'react';
import DiagnosticTestBase from '../DiagnosticTestBase';

const ComputerScienceDiagnosticTest = () => {
  const departmentConfig = {
    department: '컴퓨터공학과',
    displayName: '컴퓨터공학과',
    subject: 'computer_science',
    description: '컴퓨터공학 전문 지식 및 프로그래밍 능력 진단',
    fieldName: '컴퓨터공학',
    questionCount: 40,
    timeLimit: 80,
    supportedDepartments: [
      '컴퓨터공학과',
      '소프트웨어융합과',
      '정보시스템과',
      '인공지능학과',
      '데이터사이언스과'
    ],
    objectives: [
      '프로그래밍 언어 활용 능력 평가',
      '자료구조 및 알고리즘 이해도 측정',
      '데이터베이스 설계 및 관리 능력 확인',
      '소프트웨어 개발 방법론 숙지도 검증',
      '컴퓨터 시스템 및 네트워크 지식 평가'
    ]
  };

  return <DiagnosticTestBase departmentConfig={departmentConfig} />;
};

export default ComputerScienceDiagnosticTest; 