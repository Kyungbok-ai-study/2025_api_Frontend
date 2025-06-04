import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import useResponsive from '../hooks/useResponsive';

const Login = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet, responsive, getResponsiveStyle } = useResponsive();
  
  const [formData, setFormData] = useState({
    user_id: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keepLogin, setKeepLogin] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login-direct', formData);
      
      // TokenResponse 형식: { access_token, refresh_token, user, ... }
      if (response.data.access_token && response.data.user) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // 로그인 유지가 체크되어 있으면 자동 로그인 정보 저장
        if (keepLogin) {
          localStorage.setItem('autoLogin', JSON.stringify({
            user_id: formData.user_id,
            password: formData.password,
            keepLogin: true,
            expiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30일 후 만료
          }));
        } else {
          // 로그인 유지가 체크되지 않았으면 자동 로그인 정보 삭제
          localStorage.removeItem('autoLogin');
        }
        
        navigate('/dashboard');
      } else {
        setError('로그인 응답이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('로그인 실패:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} 로그인은 준비 중입니다.`);
  };

  // 반응형 스타일 설정
  const containerStyles = getResponsiveStyle({
    mobile: {
      padding: '20px',
      minHeight: '100vh',
    },
    tablet: {
      padding: '40px',
    },
    desktop: {
      padding: '60px',
    }
  });

  const contentWidth = responsive('90%', '400px', '400px', '420px', '450px');
  const logoSize = responsive('180px', '230px', '250px', '270px', '290px');
  const inputHeight = responsive('45px', '50px', '55px', '55px', '60px');
  const buttonHeight = responsive('45px', '50px', '55px', '55px', '60px');
  const fontSize = responsive('14px', '16px', '16px', '18px', '18px');
  const logoFontSize = responsive('14px', '16px', '18px', '18px', '20px');

  return (
    <div 
      className="min-h-screen bg-black flex items-center justify-center overflow-x-hidden"
      style={containerStyles}
    >
      <div 
        className="flex flex-col items-center w-full max-w-md mx-auto"
        style={{ width: contentWidth }}
      >
        {/* 로고 영역 */}
        <div 
          className="bg-[rgba(255,156,156,1.00)] flex items-center justify-center rounded mb-8"
          style={{ 
            width: logoSize, 
            height: responsive('40px', '50px', '55px', '55px', '60px'),
          }}
        >
          <span
            className="text-black font-normal cursor-pointer"
            style={{
              fontFamily: "AppleSDGothicNeoB00",
              fontSize: logoFontSize
            }}
            onClick={() => navigate('/')}
          >
            Logo
          </span>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div 
            className="w-full bg-red-500 text-white px-4 py-3 rounded-lg text-center mb-4"
            style={{ fontSize: responsive('12px', '14px', '14px', '15px', '16px') }}
          >
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* 아이디 입력 필드 */}
          <input
            type="text"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            required
            className="w-full px-4 rounded-[15px] transition-colors login-input"
            placeholder="아이디"
            style={{ 
              height: inputHeight,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontFamily: "AppleSDGothicNeoB00",
              fontSize: fontSize,
              color: 'white'
            }}
          />

          {/* 비밀번호 입력 필드 */}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 rounded-[15px] transition-colors login-input"
            placeholder="비밀번호"
            style={{ 
              height: inputHeight,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontFamily: "AppleSDGothicNeoB00",
              fontSize: fontSize,
              color: 'white'
            }}
          />

          {/* 캠퍼스온 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[15px] font-normal transition-colors disabled:opacity-50 hover:opacity-90"
            style={{ 
              height: buttonHeight,
              background: '#B93030',
              color: '#000000',
              fontFamily: "AppleSDGothicNeoB00",
              fontSize: fontSize,
              border: 'none'
            }}
          >
            {loading ? '로그인 중...' : '캠퍼스온 로그인'}
          </button>
        </form>

        {/* 로그인 유지 및 찾기 */}
        <div className="w-full flex justify-between items-center mt-4 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="keepLogin"
              checked={keepLogin}
              onChange={(e) => setKeepLogin(e.target.checked)}
              className="mr-2 h-3 w-3 rounded border-[rgba(100,100,100,1.00)] border bg-transparent accent-[rgba(185,48,48,1.00)]"
            />
            <label 
              htmlFor="keepLogin"
              className="cursor-pointer text-[rgba(150,150,150,1.00)]"
              style={{
                fontFamily: "AppleSDGothicNeoB00",
                fontSize: responsive('11px', '13px', '13px', '14px', '14px')
              }}
            >
              로그인 유지
            </label>
          </div>

          <span
            className="text-[rgba(150,150,150,1.00)] cursor-pointer hover:text-white transition-colors"
            style={{
              fontFamily: "AppleSDGothicNeoB00",
              fontSize: responsive('11px', '13px', '13px', '14px', '14px')
            }}
            onClick={() => alert('아이디/비밀번호 찾기는 준비 중입니다.')}
          >
            아이디/비밀번호 찾기
          </span>
        </div>

        {/* 소셜 로그인 버튼들 */}
        <div className="w-full space-y-3">
          {/* 카카오 간편로그인 */}
          <button
            type="button"
            onClick={() => handleSocialLogin('카카오')}
            className="w-full bg-[rgba(254,229,0,1.00)] hover:bg-[rgba(234,209,0,1.00)] transition-colors rounded-lg text-black font-normal"
            style={{ 
              height: buttonHeight,
              fontFamily: "AppleSDGothicNeoB00",
              fontSize: fontSize
            }}
          >
            카카오 간편로그인
          </button>

          {/* 네이버 간편로그인 */}
          <button
            type="button"
            onClick={() => handleSocialLogin('네이버')}
            className="w-full bg-[rgba(44,178,42,1.00)] hover:bg-[rgba(24,158,22,1.00)] transition-colors rounded-lg text-white font-normal"
            style={{ 
              height: buttonHeight,
              fontFamily: "AppleSDGothicNeoB00",
              fontSize: fontSize
            }}
          >
            네이버 간편로그인
          </button>

          {/* 구글 간편로그인 */}
          <button
            type="button"
            onClick={() => handleSocialLogin('구글')}
            className="w-full bg-white hover:bg-gray-100 transition-colors rounded-lg text-black font-normal"
            style={{ 
              height: buttonHeight,
              fontFamily: "AppleSDGothicNeoB00",
              fontSize: fontSize
            }}
          >
            구글 간편로그인
          </button>
        </div>

        {/* 회원가입 */}
        <div className="mt-8 mb-8">
          <span
            className="text-[rgba(150,150,150,1.00)] cursor-pointer hover:text-white transition-colors"
            style={{
              fontFamily: "AppleSDGothicNeoB00",
              fontSize: responsive('12px', '13px', '14px', '14px', '15px')
            }}
            onClick={() => alert('회원가입은 준비 중입니다.')}
          >
            회원가입
          </span>
        </div>

        {/* 하단 링크들 */}
        <div 
          className={`w-full flex ${isMobile ? 'flex-col items-center space-y-2' : 'justify-center space-x-4'} text-[rgba(120,120,120,1.00)]`}
          style={{
            fontSize: responsive('10px', '12px', '13px', '13px', '14px')
          }}
        >
          <span
            className="cursor-pointer hover:text-white transition-colors"
            style={{ fontFamily: "AppleSDGothicNeoB00" }}
            onClick={() => alert('이용약관 페이지는 준비 중입니다.')}
          >
            이용약관
          </span>
          
          <span
            className="cursor-pointer hover:text-white transition-colors"
            style={{ fontFamily: "AppleSDGothicNeoB00" }}
            onClick={() => alert('개인정보처리방침 페이지는 준비 중입니다.')}
          >
            개인정보처리방침
          </span>
          
          <span
            className="cursor-pointer hover:text-white transition-colors"
            style={{ fontFamily: "AppleSDGothicNeoB00" }}
            onClick={() => alert('문의하기 페이지는 준비 중입니다.')}
          >
            문의하기
          </span>
          
          <span style={{ fontFamily: "AppleSDGothicNeoB00" }}>
            © 경복빅데
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login; 