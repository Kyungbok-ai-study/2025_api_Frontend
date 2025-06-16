import React from 'react';

const DiagnosticTestBase_Simple = ({ departmentConfig, userDepartment }) => {
  console.log('DiagnosticTestBase_Simple 렌더링 시작');
  console.log('departmentConfig:', departmentConfig);
  console.log('userDepartment:', userDepartment);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-blue-500 text-6xl mb-4">🧪</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">진단테스트 (테스트 모드)</h2>
        <p className="text-gray-600 mb-4">
          <strong>{departmentConfig?.displayName || '알 수 없는 학과'}</strong> 진단테스트
        </p>
        <p className="text-sm text-gray-500 mb-6">
          사용자 학과: {userDepartment || '정보 없음'}
        </p>
        
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">
            ✅ DiagnosticTestBase가 정상적으로 로드되었습니다!
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => alert('테스트 시작 버튼이 클릭되었습니다!')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            테스트 시작 (시뮬레이션)
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p>💡 이것은 DiagnosticTestBase 문제 해결을 위한 임시 컴포넌트입니다.</p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTestBase_Simple; 