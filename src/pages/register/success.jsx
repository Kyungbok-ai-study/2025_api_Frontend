import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive';

const RegisterSuccess = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [userData, setUserData] = useState(null);

  // 반응형 스타일
  const containerWidth = isMobile ? '90%' : isTablet ? '80%' : '600px';
  const fontSize = isMobile ? '14px' : '16px';

  useEffect(() => {
    // 회원가입 성공 데이터 확인
    const successData = localStorage.getItem('registerSuccess');
    if (!successData) {
      navigate('/register');
      return;
    }

    const data = JSON.parse(successData);
    setUserData(data.user);

    // 성공 데이터 정리 (한 번만 사용)
    setTimeout(() => {
      localStorage.removeItem('registerSuccess');
    }, 10000); // 10초 후 삭제
  }, [navigate]);

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  if (!userData) {
    return null;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-8"
      style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        fontFamily: 'AppleSDGothicNeoB00'
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 text-center"
        style={{ width: containerWidth, maxWidth: '600px' }}
      >
        {/* 성공 아이콘 */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">회원가입 완료!</h1>
          <p className="text-gray-600" style={{ fontSize }}>
            환영합니다! 성공적으로 회원가입이 완료되었습니다.
          </p>
        </div>

        {/* 사용자 정보 */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">이름</span>
              <span className="font-semibold text-gray-800">{userData.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">아이디</span>
              <span className="font-semibold text-gray-800">{userData.user_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">이메일</span>
              <span className="font-semibold text-gray-800">{userData.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">학교</span>
              <span className="font-semibold text-gray-800">{userData.school}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">학과</span>
              <span className="font-semibold text-gray-800">{userData.department}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">입학연도</span>
              <span className="font-semibold text-gray-800">{userData.admission_year}년</span>
            </div>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            📧 가입하신 이메일로 인증 메일이 발송될 예정입니다.<br/>
            🎓 이제 로그인하여 학습을 시작해보세요!
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex space-x-4">
          <button
            onClick={handleGoToHome}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ fontSize }}
          >
            홈으로
          </button>
          <button
            onClick={handleGoToLogin}
            className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            style={{ fontSize }}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess; 