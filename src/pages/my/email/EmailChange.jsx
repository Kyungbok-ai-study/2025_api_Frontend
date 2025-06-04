import React, { useState } from 'react';
import apiClient from '../../../services/api';

const EmailChange = ({ user, onClose, onEmailUpdate }) => {
  const [formData, setFormData] = useState({
    newEmail: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 실시간 유효성 검사
    const newErrors = { ...errors };
    
    if (field === 'newEmail') {
      if (value && !validateEmail(value)) {
        newErrors.newEmail = '유효한 이메일 주소를 입력해주세요';
      } else if (value === user?.email) {
        newErrors.newEmail = '현재 이메일과 동일합니다';
      } else {
        delete newErrors.newEmail;
      }
    }
    
    if (field === 'password') {
      if (value.trim() === '') {
        newErrors.password = '비밀번호를 입력해주세요';
      } else {
        delete newErrors.password;
      }
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.newEmail) {
      setErrors(prev => ({ ...prev, newEmail: '새 이메일을 입력해주세요' }));
      return;
    }
    
    if (!validateEmail(formData.newEmail)) {
      setErrors(prev => ({ ...prev, newEmail: '유효한 이메일 주소를 입력해주세요' }));
      return;
    }
    
    if (formData.newEmail === user?.email) {
      setErrors(prev => ({ ...prev, newEmail: '현재 이메일과 동일합니다' }));
      return;
    }
    
    if (!formData.password) {
      setErrors(prev => ({ ...prev, password: '비밀번호를 입력해주세요' }));
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.put('/auth/me', {
        email: formData.newEmail,
        password: formData.password
      });
      
      alert('이메일이 성공적으로 변경되었습니다.');
      
      if (onEmailUpdate) {
        onEmailUpdate(formData.newEmail);
      }
      
      onClose();
    } catch (error) {
      console.error('이메일 변경 실패:', error);
      
      if (error.response?.status === 400) {
        const detail = error.response.data?.detail;
        if (detail?.includes('이미 사용 중인 이메일')) {
          setErrors({ newEmail: '이미 사용 중인 이메일입니다' });
        } else if (detail?.includes('비밀번호')) {
          setErrors({ password: '비밀번호가 올바르지 않습니다' });
        } else {
          setErrors({ newEmail: detail || '이메일 변경에 실패했습니다' });
        }
      } else {
        alert(error.response?.data?.detail || '이메일 변경에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-8 w-[500px] max-w-full mx-4 shadow-2xl transform animate-slideUp">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 ml-4">이메일 변경</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 현재 이메일 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">현재 이메일</label>
            <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-600">
              {user?.email || '미설정'}
            </div>
          </div>

          {/* 새 이메일 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">새 이메일</label>
            <input
              type="email"
              value={formData.newEmail}
              onChange={(e) => handleInputChange('newEmail', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                errors.newEmail ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="새 이메일 주소를 입력하세요"
            />
            {errors.newEmail && (
              <p className="text-red-600 text-sm mt-1">{errors.newEmail}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 확인</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="현재 비밀번호를 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-blue-900 mb-1">이메일 변경 안내</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 이메일 변경 시 즉시 적용됩니다</li>
                  <li>• 새 이메일로 알림이 발송됩니다</li>
                  <li>• 로그인 시 새 이메일을 사용하세요</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0 || !formData.newEmail || !formData.password}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                !loading && Object.keys(errors).length === 0 && formData.newEmail && formData.password
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  변경 중...
                </div>
              ) : (
                '이메일 변경'
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(50px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EmailChange; 