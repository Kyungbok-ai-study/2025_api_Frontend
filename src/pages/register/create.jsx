import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import useResponsive from '../../hooks/useResponsive';

const RegisterStep4 = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  
  const [registerData, setRegisterData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  
  const [validation, setValidation] = useState({
    userId: { isValid: false, message: '', isChecking: false },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' },
    email: { isValid: false, message: '' }
  });
  
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });
  
  const [loading, setLoading] = useState(false);

  // 반응형 스타일
  const containerWidth = isMobile ? '90%' : isTablet ? '80%' : '600px';
  const fontSize = isMobile ? '14px' : '16px';
  const inputHeight = isMobile ? '45px' : '50px';

  // 이전 단계 데이터 확인
  useEffect(() => {
    const savedData = localStorage.getItem('registerData');
    if (!savedData) {
      navigate('/register');
      return;
    }

    const data = JSON.parse(savedData);
    if (!data.school || !data.department || !data.verification?.isVerified) {
      navigate('/register');
      return;
    }

    setRegisterData(data);
  }, [navigate]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 실시간 유효성 검사
    validateField(name, value);
  };

  // 필드별 유효성 검사
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'userId':
        validateUserId(value);
        break;
      case 'password':
        validatePassword(value);
        break;
      case 'confirmPassword':
        validateConfirmPassword(value);
        break;
      case 'email':
        validateEmail(value);
        break;
    }
  };

  // 아이디 유효성 검사
  const validateUserId = (userId) => {
    if (!userId) {
      setValidation(prev => ({
        ...prev,
        userId: { isValid: false, message: '아이디를 입력해주세요.', isChecking: false }
      }));
      return;
    }

    if (userId.length < 4) {
      setValidation(prev => ({
        ...prev,
        userId: { isValid: false, message: '아이디는 4자리 이상이어야 합니다.', isChecking: false }
      }));
      return;
    }

    if (userId.length > 20) {
      setValidation(prev => ({
        ...prev,
        userId: { isValid: false, message: '아이디는 20자리 이하이어야 합니다.', isChecking: false }
      }));
      return;
    }

    // 영문자, 숫자만 허용
    const userIdRegex = /^[a-zA-Z0-9]+$/;
    if (!userIdRegex.test(userId)) {
      setValidation(prev => ({
        ...prev,
        userId: { isValid: false, message: '아이디는 영문자와 숫자만 사용 가능합니다.', isChecking: false }
      }));
      return;
    }

    // 아이디 중복 확인 (디바운싱)
    setValidation(prev => ({
      ...prev,
      userId: { isValid: false, message: '중복 확인 중...', isChecking: true }
    }));

    setTimeout(() => {
      checkUserIdDuplicate(userId);
    }, 500);
  };

  // 아이디 중복 확인
  const checkUserIdDuplicate = async (userId) => {
    try {
      const response = await apiClient.get(`/auth/check-userid/${userId}`);
      
      console.log('아이디 중복 확인 API 응답:', JSON.stringify(response.data, null, 2));
      
      // API가 성공적으로 응답한 경우
      if (response.data.success) {
        if (response.data.data.available) {
          setValidation(prev => ({
            ...prev,
            userId: { isValid: true, message: '사용 가능한 아이디입니다.', isChecking: false }
          }));
        } else {
          setValidation(prev => ({
            ...prev,
            userId: { isValid: false, message: '이미 사용 중인 아이디입니다.', isChecking: false }
          }));
        }
      } else {
        // API에서 에러를 반환한 경우
        console.warn('API 에러:', response.data.message);
        setValidation(prev => ({
          ...prev,
          userId: { isValid: false, message: '아이디 중복 확인에 실패했습니다. 다시 시도해주세요.', isChecking: false }
        }));
      }
    } catch (error) {
      console.error('아이디 중복 확인 오류:', error);
      
      // 네트워크 에러 또는 기타 에러인 경우 임시로 클라이언트 사이드에서 중복 확인
      const duplicateIds = ['admin', 'test', 'user', 'guest', 'root'];
      
      if (duplicateIds.includes(userId.toLowerCase())) {
        setValidation(prev => ({
          ...prev,
          userId: { isValid: false, message: '이미 사용 중인 아이디입니다.', isChecking: false }
        }));
      } else {
        setValidation(prev => ({
          ...prev,
          userId: { isValid: true, message: '사용 가능한 아이디입니다. (임시)', isChecking: false }
        }));
      }
    }
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    if (!password) {
      setValidation(prev => ({
        ...prev,
        password: { isValid: false, message: '비밀번호를 입력해주세요.' }
      }));
      return;
    }

    if (password.length < 8) {
      setValidation(prev => ({
        ...prev,
        password: { isValid: false, message: '비밀번호는 8자리 이상이어야 합니다.' }
      }));
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLetter || !hasNumber) {
      setValidation(prev => ({
        ...prev,
        password: { isValid: false, message: '영문자와 숫자를 포함해야 합니다.' }
      }));
      return;
    }

    setValidation(prev => ({
      ...prev,
      password: { isValid: true, message: '사용 가능한 비밀번호입니다.' }
    }));

    // 비밀번호 확인도 다시 검사
    if (formData.confirmPassword) {
      validateConfirmPassword(formData.confirmPassword);
    }
  };

  // 비밀번호 확인 유효성 검사
  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      setValidation(prev => ({
        ...prev,
        confirmPassword: { isValid: false, message: '비밀번호 확인을 입력해주세요.' }
      }));
      return;
    }

    if (confirmPassword !== formData.password) {
      setValidation(prev => ({
        ...prev,
        confirmPassword: { isValid: false, message: '비밀번호가 일치하지 않습니다.' }
      }));
      return;
    }

    setValidation(prev => ({
      ...prev,
      confirmPassword: { isValid: true, message: '비밀번호가 일치합니다.' }
    }));
  };

  // 이메일 유효성 검사
  const validateEmail = (email) => {
    if (!email) {
      setValidation(prev => ({
        ...prev,
        email: { isValid: false, message: '이메일을 입력해주세요.' }
      }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidation(prev => ({
        ...prev,
        email: { isValid: false, message: '올바른 이메일 형식이 아닙니다.' }
      }));
      return;
    }

    setValidation(prev => ({
      ...prev,
      email: { isValid: true, message: '사용 가능한 이메일입니다.' }
    }));
  };

  // 비밀번호 보기/숨기기 토글
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    return (
      formData.name.trim() &&
      validation.userId.isValid &&
      validation.password.isValid &&
      validation.confirmPassword.isValid &&
      validation.email.isValid
    );
  };

  // 회원가입 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert('모든 필드를 올바르게 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      // 이용약관 및 본인인증 정보 가져오기
      const agreementData = registerData.agreements || {};
      const verificationData = registerData.verification || {};
      
      console.log('회원가입 데이터 준비:', {
        userId: formData.userId,
        name: formData.name,
        email: formData.email,
        school: registerData.school.school_name,
        department: registerData.department.department_name,
        admissionYear: registerData.admissionYear,
        agreementData,
        verificationData
      });
      
      // 백엔드 API 호출
      const requestData = {
        user_id: formData.userId,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        school: registerData.school.school_name,
        department: registerData.department.department_name,
        admission_year: parseInt(registerData.admissionYear),
        phone_number: verificationData.phoneNumber || '',
        verification_method: verificationData.method || 'phone',
        
        // 이용약관 동의 정보
        terms_agreed: agreementData.terms || false,
        privacy_agreed: agreementData.privacy || false,
        privacy_optional_agreed: agreementData.privacyOptional || false,
        marketing_agreed: agreementData.marketing || false,
        identity_verified: agreementData.identity || false,
        age_verified: agreementData.ageCheck || false
      };
      
      console.log('API 호출 데이터:', requestData);
      
      const response = await apiClient.post('/auth/register', requestData);
      
      console.log('API 응답 전체:', JSON.stringify(response, null, 2));
      console.log('API 응답 데이터:', JSON.stringify(response.data, null, 2));
      console.log('API 응답 성공 여부:', response.data?.success);

      if (response.data && response.data.success) {
        // 회원가입 성공 데이터 저장
        localStorage.setItem('registerSuccess', JSON.stringify({
          user: response.data.data,
          registeredAt: new Date().toISOString()
        }));
        
        // localStorage에서 임시 데이터 삭제
        localStorage.removeItem('registerData');
        
        alert('회원가입이 완료되었습니다!');
        navigate('/register/success');
      } else {
        console.warn('회원가입 실패:', response.data);
        const errorMessage = response.data?.message || '회원가입에 실패했습니다.';
        alert(`회원가입 실패: ${errorMessage}`);
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      console.error('에러 응답:', error.response?.data);
      
      // HTTPException으로 반환되는 오류 처리
      if (error.response?.status === 400) {
        // 필수 약관 동의 오류
        alert(`회원가입 실패: ${error.response.data.detail}`);
      } else if (error.response?.status === 409) {
        // 중복 오류 (아이디, 이메일)
        alert(`회원가입 실패: ${error.response.data.detail}`);
      } else if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
        // FastAPI validation 오류 처리
        const validationErrors = error.response.data.detail.map(err => {
          const field = err.loc ? err.loc.join('.') : 'unknown';
          return `${field}: ${err.msg}`;
        }).join('\n');
        alert(`입력 데이터 오류:\n${validationErrors}`);
      } else if (error.response?.data?.detail) {
        // 기타 백엔드 오류
        alert(`회원가입 실패: ${error.response.data.detail}`);
      } else if (error.message) {
        alert(`네트워크 오류: ${error.message}`);
      } else {
        alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 이전 단계로
  const handleBack = () => {
    navigate('/register/agreement');
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
            4단계: 계정 정보 입력
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-2 bg-blue-500 rounded-full"></div>
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

        {/* 계정 정보 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이름 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" style={{ fontSize }}>
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="실명을 입력해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ height: inputHeight, fontSize }}
              required
            />
          </div>

          {/* 아이디 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" style={{ fontSize }}>
              아이디 <span className="text-red-500">*</span>
              <span className="text-sm text-gray-500 ml-2">(로그인 시 사용)</span>
            </label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="영문자, 숫자 4-20자리"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                validation.userId.isValid 
                  ? 'border-green-300 focus:ring-green-500' 
                  : formData.userId && !validation.userId.isChecking
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
              }`}
              style={{ height: inputHeight, fontSize }}
              required
            />
            {formData.userId && (
              <p className={`text-sm mt-1 ${
                validation.userId.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {validation.userId.isChecking && (
                  <span className="inline-flex items-center">
                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2 inline-block"></span>
                    {validation.userId.message}
                  </span>
                )}
                {!validation.userId.isChecking && validation.userId.message}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" style={{ fontSize }}>
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.password ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="영문자, 숫자 포함 8자리 이상"
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 ${
                  validation.password.isValid 
                    ? 'border-green-300 focus:ring-green-500' 
                    : formData.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
                style={{ height: inputHeight, fontSize }}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('password')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.password ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formData.password && (
              <p className={`text-sm mt-1 ${
                validation.password.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {validation.password.message}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" style={{ fontSize }}>
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력해주세요"
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 ${
                  validation.confirmPassword.isValid 
                    ? 'border-green-300 focus:ring-green-500' 
                    : formData.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
                style={{ height: inputHeight, fontSize }}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword.confirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formData.confirmPassword && (
              <p className={`text-sm mt-1 ${
                validation.confirmPassword.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {validation.confirmPassword.message}
              </p>
            )}
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2" style={{ fontSize }}>
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="이메일 주소를 입력해주세요"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                validation.email.isValid 
                  ? 'border-green-300 focus:ring-green-500' 
                  : formData.email
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
              }`}
              style={{ height: inputHeight, fontSize }}
              required
            />
            {formData.email && (
              <p className={`text-sm mt-1 ${
                validation.email.isValid ? 'text-green-600' : 'text-red-600'
              }`}>
                {validation.email.message}
              </p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ fontSize }}
            >
              이전
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              style={{ fontSize }}
            >
              {loading ? (
                <span className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  가입 중...
                </span>
              ) : (
                '회원가입 완료'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterStep4; 