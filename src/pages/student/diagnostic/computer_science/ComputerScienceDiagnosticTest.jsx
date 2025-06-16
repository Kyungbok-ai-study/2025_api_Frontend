import React from 'react';
import DiagnosticTestBase from '../DiagnosticTestBase';

const ComputerScienceDiagnosticTest = (props) => {
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

  console.log('ComputerScienceDiagnosticTest 렌더링 시작');
  console.log('departmentConfig:', departmentConfig);
  console.log('userDepartment:', userDepartment);

  return (
    <DiagnosticTestBase 
      departmentConfig={departmentConfig} 
      userDepartment={userDepartment}
    />
  );
};

export default ComputerScienceDiagnosticTest; 