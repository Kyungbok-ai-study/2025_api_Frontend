import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useResponsive from '../../hooks/useResponsive';

const RegisterStep3 = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  
  const [registerData, setRegisterData] = useState(null);
  const [agreements, setAgreements] = useState({
    allAgree: false,
    terms: false,
    privacy: false,
    privacyOptional: false,
    marketing: false,
    identity: false,
    ageCheck: false
  });
  
  // 약관 내용 표시 상태
  const [showTermsContent, setShowTermsContent] = useState({
    terms: true,
    privacy: true,
    privacyOptional: true,
    marketing: true
  });
  
  const [verification, setVerification] = useState({
    method: '', // 'phone' or 'ipin'
    phoneNumber: '',
    verificationCode: '',
    isCodeSent: false,
    isVerified: false,
    timer: 0
  });

  // 반응형 스타일
  const containerWidth = isMobile ? '90%' : isTablet ? '80%' : '600px';
  const fontSize = isMobile ? '14px' : '16px';
  const inputHeight = isMobile ? '45px' : '50px';

  // 약관 내용
  const termsContent = {
    terms: `제1조 (목적)
이 약관은 회사가 제공하는 서비스의 이용에 관한 조건 및 절차, 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
1. "서비스"란 회사가 제공하는 모든 서비스를 의미합니다.
2. "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
3. "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.

제3조 (약관의 효력 및 변경)
1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 공지함으로써 효력을 발생합니다.
2. 회사는 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.`,

    privacy: `개인정보 수집 및 이용 동의서

1. 수집하는 개인정보 항목
- 필수항목: 이름, 이메일, 휴대폰번호, 학교명, 학과명, 학번
- 선택항목: 생년월일, 성별

2. 개인정보의 수집 및 이용목적
- 회원가입 및 관리
- 서비스 제공 및 운영
- 고객 상담 및 불만처리
- 공지사항 전달

3. 개인정보의 보유 및 이용기간
- 회원탈퇴 시까지 (단, 관련법령에 따라 일정기간 보관)
- 회원탈퇴 후 즉시 파기 원칙

4. 개인정보 제공 거부권 및 불이익
- 개인정보 수집에 대한 동의를 거부할 권리가 있습니다.
- 동의 거부 시 회원가입이 제한될 수 있습니다.`,

    privacyOptional: `개인정보 수집 및 이용 동의서 (선택사항)

1. 수집하는 개인정보 항목
- 선택항목: 주소, 관심분야, 취미, 추가 연락처

2. 개인정보의 수집 및 이용목적
- 맞춤형 서비스 제공
- 이벤트 및 프로모션 안내
- 서비스 개선을 위한 통계분석
- 신규 서비스 개발 및 특화

3. 개인정보의 보유 및 이용기간
- 동의 철회 시까지
- 회원탈퇴 시 즉시 파기

4. 개인정보 제공 거부권
- 선택항목 제공을 거부할 수 있으며, 거부 시에도 기본 서비스 이용에는 제한이 없습니다.`,

    marketing: `광고성 정보 수신 동의서

1. 광고성 정보의 내용
- 신규 서비스 및 상품 안내
- 이벤트 및 프로모션 정보
- 할인 혜택 및 쿠폰 제공
- 맞춤형 광고 및 추천 서비스

2. 광고성 정보 전송 방법
- 이메일
- SMS/MMS
- 앱 푸시 알림
- 서비스 내 알림

3. 광고성 정보 전송 시간
- 오전 8시부터 오후 9시까지
- 공휴일 및 주말 제외 (긴급한 경우 예외)

4. 수신 동의 철회
- 언제든지 수신을 거부할 수 있습니다.
- 마이페이지에서 설정 변경 가능합니다.`
  };

  // 이전 단계 데이터 확인
  useEffect(() => {
    const savedData = localStorage.getItem('registerData');
    if (!savedData) {
      navigate('/register');
      return;
    }

    const data = JSON.parse(savedData);
    if (!data.school || !data.department) {
      navigate('/register');
      return;
    }

    setRegisterData(data);
  }, [navigate]);

  // 타이머 효과
  useEffect(() => {
    let interval = null;
    if (verification.timer > 0) {
      interval = setInterval(() => {
        setVerification(prev => ({
          ...prev,
          timer: prev.timer - 1
        }));
      }, 1000);
    } else if (verification.timer === 0 && verification.isCodeSent) {
      setVerification(prev => ({
        ...prev,
        isCodeSent: false
      }));
    }
    return () => clearInterval(interval);
  }, [verification.timer]);

  // 전체 동의 처리
  const handleAllAgree = (checked) => {
    setAgreements({
      allAgree: checked,
      terms: checked,
      privacy: checked,
      privacyOptional: checked,
      marketing: checked,
      identity: checked,
      ageCheck: checked
    });
    
    // 전체 동의 시 모든 약관 내용 숨김, 해제 시 모든 약관 내용 표시
    setShowTermsContent({
      terms: !checked,
      privacy: !checked,
      privacyOptional: !checked,
      marketing: !checked
    });
  };

  // 개별 동의 처리
  const handleIndividualAgree = (key, checked) => {
    const newAgreements = {
      ...agreements,
      [key]: checked
    };
    
    // 전체 동의 상태 업데이트 (모든 필수 항목과 선택 항목이 체크된 경우)
    newAgreements.allAgree = newAgreements.terms && newAgreements.privacy && 
                              newAgreements.privacyOptional && newAgreements.marketing && 
                              newAgreements.identity && newAgreements.ageCheck;
    
    setAgreements(newAgreements);
    
    // 약관 내용 표시/숨김 처리
    if (key === 'terms' || key === 'privacy' || key === 'privacyOptional' || key === 'marketing') {
      setShowTermsContent(prev => ({
        ...prev,
        [key]: !checked  // 동의하면 숨기고(false), 동의 해제하면 보이기(true)
      }));
    }
  };

  // 약관 내용 표시/숨김 토글
  const toggleTermsContent = (key) => {
    setShowTermsContent(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 휴대폰 인증번호 발송
  const handleSendVerificationCode = () => {
    if (!verification.phoneNumber || verification.phoneNumber.length < 10) {
      alert('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    // 실제로는 SMS API를 호출해야 함
    setVerification(prev => ({
      ...prev,
      isCodeSent: true,
      timer: 180 // 3분
    }));
    
    alert('인증번호가 발송되었습니다.');
  };

  // 인증번호 확인
  const handleVerifyCode = () => {
    if (!verification.verificationCode) {
      alert('인증번호를 입력해주세요.');
      return;
    }

    // 실제로는 서버에서 인증번호를 확인해야 함
    // 여기서는 임시로 '123456'을 정답으로 설정
    if (verification.verificationCode === '123456') {
      setVerification(prev => ({
        ...prev,
        isVerified: true,
        timer: 0
      }));
      alert('인증이 완료되었습니다.');
    } else {
      alert('인증번호가 올바르지 않습니다.');
    }
  };

  // 아이핀 인증 (임시)
  const handleIpinVerification = () => {
    // 실제로는 아이핀 인증 팝업을 열어야 함
    const confirmed = window.confirm('아이핀 인증을 진행하시겠습니까?\n(데모에서는 확인을 누르면 인증 완료됩니다)');
    if (confirmed) {
      setVerification(prev => ({
        ...prev,
        method: 'ipin',
        isVerified: true
      }));
      alert('아이핀 인증이 완료되었습니다.');
    }
  };

  // 다음 단계로
  const handleNext = () => {
    // 필수 동의 확인
    if (!agreements.terms || !agreements.privacy || !agreements.identity || !agreements.ageCheck) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    // 본인인증 확인
    if (!verification.isVerified) {
      alert('본인인증을 완료해주세요.');
      return;
    }

    const updatedData = {
      ...registerData,
      agreements,
      verification: {
        method: verification.method,
        phoneNumber: verification.phoneNumber,
        isVerified: verification.isVerified
      }
    };

    localStorage.setItem('registerData', JSON.stringify(updatedData));
    navigate('/register/create');
  };

  // 이전 단계로
  const handleBack = () => {
    navigate('/register/dept');
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-8"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'AppleSDGothicNeoB00'
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8"
        style={{ width: containerWidth, maxWidth: '600px' }}
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">회원가입</h1>
          <p className="text-gray-600" style={{ fontSize }}>
            3단계: 약관동의 및 본인인증
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 선택된 정보 요약 */}
        {registerData && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-blue-900">{registerData.school.school_name}</div>
                <div className="text-sm text-blue-700">{registerData.department.department_name} • {registerData.admissionYear}학번</div>
              </div>
            </div>
          </div>
        )}

        {/* 약관 동의 */}
        <div className="mb-8">
          <h3 className="text-gray-700 font-medium mb-4" style={{ fontSize }}>📋 약관 동의</h3>
          
          {/* 전체 동의 */}
          <div className="mb-4 p-4 border-2 border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={agreements.allAgree}
                onChange={(e) => handleAllAgree(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-3 font-bold text-blue-900" style={{ fontSize }}>
                ✅ 아래 약관에 모두 동의합니다
              </span>
            </label>
          </div>

          {/* 개별 약관 */}
          <div className="space-y-4">
            {/* 서비스 이용약관 */}
            <div className="border border-gray-200 rounded-xl p-4">
              <label className="flex items-center mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.terms}
                  onChange={(e) => handleIndividualAgree('terms', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 font-medium" style={{ fontSize }}>
                  서비스 이용약관 동의 <span className="text-red-500">(필수)</span>
                </span>
              </label>
              
              {showTermsContent.terms && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div 
                    className="text-sm text-gray-700 overflow-y-auto whitespace-pre-line leading-relaxed"
                    style={{ maxHeight: '200px' }}
                  >
                    {termsContent.terms}
                  </div>
                </div>
              )}
            </div>

            {/* 개인정보 수집 및 이용 동의 (필수) */}
            <div className="border border-gray-200 rounded-xl p-4">
              <label className="flex items-center mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={(e) => handleIndividualAgree('privacy', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 font-medium" style={{ fontSize }}>
                  개인정보 수집 및 이용 동의 <span className="text-red-500">(필수)</span>
                </span>
              </label>
              
              {showTermsContent.privacy && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div 
                    className="text-sm text-gray-700 overflow-y-auto whitespace-pre-line leading-relaxed"
                    style={{ maxHeight: '200px' }}
                  >
                    {termsContent.privacy}
                  </div>
                </div>
              )}
            </div>

            {/* 개인정보 수집 및 이용 동의 (선택) */}
            <div className="border border-gray-200 rounded-xl p-4">
              <label className="flex items-center mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.privacyOptional}
                  onChange={(e) => handleIndividualAgree('privacyOptional', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 font-medium" style={{ fontSize }}>
                  개인정보 수집 및 이용 동의 <span className="text-gray-500">(선택)</span>
                </span>
              </label>
              
              {showTermsContent.privacyOptional && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div 
                    className="text-sm text-gray-700 overflow-y-auto whitespace-pre-line leading-relaxed"
                    style={{ maxHeight: '200px' }}
                  >
                    {termsContent.privacyOptional}
                  </div>
                </div>
              )}
            </div>

            {/* 광고성 정보 수신 동의 */}
            <div className="border border-gray-200 rounded-xl p-4">
              <label className="flex items-center mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.marketing}
                  onChange={(e) => handleIndividualAgree('marketing', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 font-medium" style={{ fontSize }}>
                  광고성 정보 수신 동의 <span className="text-gray-500">(선택)</span>
                </span>
              </label>
              
              {showTermsContent.marketing && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div 
                    className="text-sm text-gray-700 overflow-y-auto whitespace-pre-line leading-relaxed"
                    style={{ maxHeight: '200px' }}
                  >
                    {termsContent.marketing}
                  </div>
                </div>
              )}
            </div>

            {/* 본인 명의 확인 */}
            <div className="border border-gray-200 rounded-xl p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.identity}
                  onChange={(e) => handleIndividualAgree('identity', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 font-medium" style={{ fontSize }}>
                  본인 명의를 이용하여 가입을 진행하겠습니다 <span className="text-red-500">(필수)</span>
                </span>
              </label>
            </div>

            {/* 연령 확인 */}
            <div className="border border-gray-200 rounded-xl p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.ageCheck}
                  onChange={(e) => handleIndividualAgree('ageCheck', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 font-medium" style={{ fontSize }}>
                  만 14세 이상입니다 <span className="text-red-500">(필수)</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 본인인증 */}
        <div className="mb-8">
          <h3 className="text-gray-700 font-medium mb-4" style={{ fontSize }}>🔐 본인인증</h3>
          
          {!verification.isVerified ? (
            <div className="space-y-4">
              {/* 인증 방법 선택 */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setVerification(prev => ({ ...prev, method: 'phone' }))}
                  className={`py-3 px-4 border rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                    verification.method === 'phone'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{ fontSize }}
                >
                  <span>📱</span>
                  <span>휴대폰 인증</span>
                </button>
                <button
                  onClick={handleIpinVerification}
                  className="py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-2"
                  style={{ fontSize }}
                >
                  <span>🆔</span>
                  <span>아이핀 인증</span>
                </button>
              </div>

              {/* 휴대폰 인증 */}
              {verification.method === 'phone' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="tel"
                      value={verification.phoneNumber}
                      onChange={(e) => setVerification(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="휴대폰 번호 (- 없이 입력)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ height: inputHeight, fontSize }}
                      maxLength={11}
                    />
                    <button
                      onClick={handleSendVerificationCode}
                      disabled={verification.isCodeSent}
                      className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      style={{ fontSize }}
                    >
                      {verification.isCodeSent ? '발송됨' : '인증번호 발송'}
                    </button>
                  </div>

                  {verification.isCodeSent && (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={verification.verificationCode}
                        onChange={(e) => setVerification(prev => ({ ...prev, verificationCode: e.target.value }))}
                        placeholder="인증번호 입력"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{ height: inputHeight, fontSize }}
                        maxLength={6}
                      />
                      <button
                        onClick={handleVerifyCode}
                        className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors whitespace-nowrap"
                        style={{ fontSize }}
                      >
                        확인
                      </button>
                      <div className="flex items-center px-3 text-red-500 font-mono font-bold">
                        {formatTime(verification.timer)}
                      </div>
                    </div>
                  )}

                  {verification.isCodeSent && (
                    <div className="text-center">
                      <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-200">
                        📱 인증번호가 발송되었습니다. (데모: <strong>123456</strong>)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-green-900">✅ 본인인증 완료</div>
                  <div className="text-sm text-green-700">
                    {verification.method === 'phone' ? `📱 휴대폰 인증 (${verification.phoneNumber})` : '🆔 아이핀 인증'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex space-x-4">
          <button
            onClick={handleBack}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ fontSize }}
          >
            이전
          </button>
          <button
            onClick={handleNext}
            disabled={!agreements.terms || !agreements.privacy || !agreements.identity || !agreements.ageCheck || !verification.isVerified}
            className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            style={{ fontSize }}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep3; 