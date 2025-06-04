import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";

const Desktopmain = () => {
  const navigate = useNavigate();

  // 애니메이션을 위한 상태 설정
  const [studyRate, setStudyRate] = useState(0);
  const [todayTime, setTodayTime] = useState(0);
  const [correctRate, setCorrectRate] = useState(0);
  const [continuousDays, setContinuousDays] = useState(0);
  const [barWidths, setBarWidths] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [progressWidth, setProgressWidth] = useState(0);

  // 최종 값
  const finalStudyRate = 78;
  const finalTodayTime = 245;
  const finalCorrectRate = 85;
  const finalContinuousDays = 7;
  const finalBarHeights = [48, 64, 36, 72, 56, 24, 20]; // 각 막대의 최종 높이
  const finalProgressWidth = 80; // 80%

  // 자동 로그인 처리 함수
  const handleLoginClick = async () => {
    try {
      // localStorage에서 자동 로그인 정보 확인
      const autoLoginData = localStorage.getItem('autoLogin');
      
      if (autoLoginData) {
        const loginInfo = JSON.parse(autoLoginData);
        
        // 만료일 체크
        if (loginInfo.expiry && Date.now() > loginInfo.expiry) {
          localStorage.removeItem('autoLogin');
          navigate('/login');
          return;
        }
        
        // 자동 로그인 시도
        try {
          const response = await apiClient.post('/auth/login-direct', {
            user_id: loginInfo.user_id,
            password: loginInfo.password
          });
          
          if (response.data.access_token && response.data.user) {
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
            return;
          } else {
            // 자동 로그인 실패시 저장된 정보 삭제하고 로그인 페이지로
            localStorage.removeItem('autoLogin');
            navigate('/login');
            return;
          }
        } catch (error) {
          // 자동 로그인 실패시 저장된 정보 삭제하고 로그인 페이지로
          localStorage.removeItem('autoLogin');
          navigate('/login');
          return;
        }
      }
      
      // 저장된 로그인 정보가 없으면 일반 로그인 페이지로
      navigate('/login');
    } catch (error) {
      console.error('자동 로그인 체크 중 오류:', error);
      navigate('/login');
    }
  };

  // 컴포넌트가 마운트되면 애니메이션 시작
  useEffect(() => {
    // 숫자 증가 애니메이션
    const studyRateInterval = setInterval(() => {
      setStudyRate(prev => {
        if (prev < finalStudyRate) return prev + 1;
        clearInterval(studyRateInterval);
        return finalStudyRate;
      });
    }, 20);

    const todayTimeInterval = setInterval(() => {
      setTodayTime(prev => {
        if (prev < finalTodayTime) return prev + 2;
        clearInterval(todayTimeInterval);
        return finalTodayTime;
      });
    }, 15);

    const correctRateInterval = setInterval(() => {
      setCorrectRate(prev => {
        if (prev < finalCorrectRate) return prev + 1;
        clearInterval(correctRateInterval);
        return finalCorrectRate;
      });
    }, 20);

    const continuousDaysInterval = setInterval(() => {
      setContinuousDays(prev => {
        if (prev < finalContinuousDays) return prev + 1;
        clearInterval(continuousDaysInterval);
        return finalContinuousDays;
      });
    }, 200);

    // 그래프 막대 애니메이션
    setTimeout(() => {
      setBarWidths(finalBarHeights);
    }, 500);

    // 진행률 바 애니메이션
    const progressInterval = setInterval(() => {
      setProgressWidth(prev => {
        if (prev < finalProgressWidth) return prev + 1;
        clearInterval(progressInterval);
        return finalProgressWidth;
      });
    }, 20);

    return () => {
      clearInterval(studyRateInterval);
      clearInterval(todayTimeInterval);
      clearInterval(correctRateInterval);
      clearInterval(continuousDaysInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      {/* 왼쪽 사이드바 - 완전 반응형 */}
      <div className="w-full lg:w-[250px] xl:w-[300px] lg:fixed lg:left-0 lg:top-0 lg:h-full bg-white z-10 shadow-lg">
        {/* 로그인 영역 */}
        <div className="p-3 sm:p-4 lg:p-5">
          <button 
            onClick={handleLoginClick}
            className="bg-white border border-[rgba(255,44,44,1.00)] h-[36px] sm:h-[40px] lg:h-[43px] w-full rounded-[12px] sm:rounded-[15px] mb-3 flex items-center justify-center transition-all duration-300 hover:bg-red-50 hover:shadow-md active:scale-95">
            <span className="text-[rgba(255,44,44,1.00)] text-[12px] sm:text-[14px] lg:text-[16px] font-normal" style={{ fontFamily: "AppleSDGothicNeoB00" }}>
              로그인
            </span>
          </button>
          
          <button 
            onClick={() => navigate('/register')}
            className="bg-[rgba(255,44,44,1.00)] border-none h-[36px] sm:h-[40px] lg:h-[43px] w-full rounded-[12px] sm:rounded-[15px] mb-2 flex items-center justify-center transition-all duration-300 hover:bg-[rgba(255,66,66,1.00)] hover:shadow-md active:scale-95">
            <span className="text-white text-[12px] sm:text-[14px] lg:text-[16px] font-normal" style={{ fontFamily: "AppleSDGothicNeoB00" }}>
              캠퍼스온 회원가입
            </span>
          </button>
          
          <div className="text-center mt-2">
            <button className="text-[rgba(40,40,40,0.75)] text-[10px] sm:text-[11px] lg:text-[12px] font-normal bg-transparent border-none transition-all duration-300 hover:text-[rgba(40,40,40,1.00)] active:scale-95" style={{ fontFamily: "AppleSDGothicNeoB00" }}>
              아이디/비밀번호 찾기
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 - 완전 반응형 */}
      <div className="w-full lg:ml-[250px] xl:ml-[300px] lg:w-[calc(100%-250px)] xl:w-[calc(100%-300px)] relative">
        <div className="relative w-full min-h-screen">
          {/* 배경 원형 요소들 - 반응형 */}
          <div className="absolute bg-[rgba(255,204,204,1.00)] h-[150px] sm:h-[220px] md:h-[300px] lg:h-[370px] w-[150px] sm:w-[220px] md:w-[300px] lg:w-[370px] rounded-[50%] left-[5%] sm:left-[8%] md:left-[12%] lg:left-[204px] top-[250px] sm:top-[350px] md:top-[420px] lg:top-[476px] -z-10"></div>
          <div className="absolute bg-[rgba(255,204,204,1.00)] h-[400px] sm:h-[600px] md:h-[850px] lg:h-[1080px] w-[400px] sm:w-[600px] md:w-[850px] lg:w-[1080px] top-[-50px] sm:top-[-80px] md:top-[-100px] lg:top-[-118px] rounded-[50%] right-[-150px] sm:right-[-200px] md:right-[-300px] lg:left-[866px] -z-10"></div>
          <div className="absolute bg-[rgba(255,204,204,1.00)] h-[200px] sm:h-[350px] md:h-[450px] lg:h-[589px] w-[200px] sm:w-[350px] md:w-[450px] lg:w-[589px] top-[-80px] sm:top-[-130px] md:top-[-180px] lg:top-[-230px] rounded-[50%] left-[30px] sm:left-[80px] md:left-[120px] lg:left-[170px] -z-10"></div>
          <div className="absolute bg-[rgba(255,156,156,1.00)] h-[80px] sm:h-[130px] md:h-[180px] lg:h-[236px] w-[80px] sm:w-[130px] md:w-[180px] lg:w-[236px] rounded-[50%] right-[15px] sm:right-[40px] md:right-[70px] lg:right-[100px] top-[120px] sm:top-[170px] md:top-[210px] lg:top-[240px] -z-10"></div>

          {/* 흰색 배경의 컨테이너 - 반응형 */}
          <div className="absolute bg-[rgba(255,255,255,0.64)] backdrop-blur-[15px] sm:backdrop-blur-[20px] lg:backdrop-blur-[26.7px] h-[300px] sm:h-[450px] md:h-[580px] lg:h-[716.81px] w-full left-0 top-0">
            {/* 메인 텍스트 - 반응형 */}
            <div className="relative mt-[50px] sm:mt-[80px] md:mt-[130px] lg:mt-[197px] ml-[20px] sm:ml-[40px] md:ml-[60px] lg:ml-[539px] px-4 lg:px-0">
              <span className="flex items-center h-auto w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[366px]">
                <span className="bg-[rgba(0,0,0,0.90)] bg-clip-text text-transparent text-[24px] sm:text-[36px] md:text-[48px] lg:text-[64px] font-normal leading-tight" style={{ fontFamily: "AppleSDGothicNeoB00" }}>
                  함께하는 공부,<br />
                  캠퍼스온
                </span>
              </span>
              
              <span className="flex items-center h-auto w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[477px] absolute top-[60px] sm:top-[90px] md:top-[120px] lg:top-[170px]">
                <span className="bg-[rgba(0,0,0,0.70)] bg-clip-text text-transparent text-[14px] sm:text-[18px] md:text-[24px] lg:text-[32px] font-normal leading-tight" style={{ fontFamily: "AppleSDGothicNeoR00" }}>
                  캠퍼스온에서 우리 학교 학생들과 함께<br />
                  여러분이 원하는 교육을 받아보세요.
                </span>
              </span>

              {/* Logo - 반응형 */}
              <span className="flex justify-center items-center h-auto w-auto absolute right-[20px] sm:right-[40px] md:right-[60px] lg:left-[771px] top-[-10px] sm:top-[10px] md:top-[40px] lg:top-[100px]">
                <img src="/kbulogo.png" alt="경복대학교 로고" className="h-[25px] sm:h-[35px] md:h-[50px] lg:h-[70px] xl:h-[80px] 2xl:h-[90px] w-auto object-contain" />
              </span>
              
              {/* 앱 스토어 버튼 - 반응형 */}
              <div className="absolute top-[120px] sm:top-[160px] md:top-[200px] lg:top-[265px] flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
                <button className="bg-[rgba(40,40,40,1.00)] h-[35px] sm:h-[45px] md:h-[52px] lg:h-[58px] w-[120px] sm:w-[140px] md:w-[150px] lg:w-[158px] rounded-[8px] sm:rounded-[10px] flex justify-center items-center transition-all duration-300 hover:bg-[rgba(60,60,60,1.00)] hover:shadow-lg active:scale-95">
                  <img src="assets/images/apple_store_logo.svg" alt="apple_store_logo" className="mr-1 sm:mr-2 h-[12px] sm:h-[14px] md:h-[16px] lg:h-[18px]" />
                  <span className="text-white text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] font-normal" style={{ fontFamily: "AppleSDGothicNeoB00" }}>
                    App Store
                  </span>
                </button>
                
                <button className="bg-[rgba(40,40,40,1.00)] h-[35px] sm:h-[45px] md:h-[52px] lg:h-[58px] w-[120px] sm:w-[140px] md:w-[150px] lg:w-[158px] rounded-[8px] sm:rounded-[10px] flex justify-center items-center transition-all duration-300 hover:bg-[rgba(60,60,60,1.00)] hover:shadow-lg active:scale-95">
                  <img src="assets/images/google_play_logo.svg" alt="google_play_logo" className="mr-1 sm:mr-2 h-[12px] sm:h-[14px] md:h-[16px] lg:h-[18px]" />
                  <span className="text-white text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] font-normal" style={{ fontFamily: "AppleSDGothicNeoB00" }}>
                    Google Play
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 24/7 섹션 - 반응형 */}
          <div className="absolute bg-[rgba(255,247,247,1.00)] h-auto w-full left-0 top-[300px] sm:top-[450px] md:top-[580px] lg:top-[717px] pb-[30px] sm:pb-[40px] lg:pb-[50px]">
            <div className="relative px-4 sm:px-6 lg:px-0">
              <span className="flex justify-center lg:justify-end text-center lg:text-right items-start h-auto w-full lg:w-[224px] absolute left-1/2 lg:left-[437px] top-[30px] sm:top-[50px] lg:top-[79px] transform -translate-x-1/2 lg:transform-none">
                <span>
                  <span className="whitespace-nowrap bg-[rgba(255,129,129,1.00)] bg-clip-text text-transparent text-[20px] sm:text-[28px] md:text-[36px] lg:text-[48px] font-bold" style={{ fontFamily: "Inter" }}>
                    24/7
                  </span>
                  <span className="whitespace-nowrap bg-black bg-clip-text text-transparent text-[20px] sm:text-[28px] md:text-[36px] lg:text-[48px] font-bold" style={{ fontFamily: "Inter" }}>
                    소통,
                  </span>
                </span>
              </span>
              
              <span className="flex justify-center lg:justify-end text-center lg:text-right items-start h-auto w-full lg:w-[224px] absolute left-1/2 lg:left-[904px] top-[70px] sm:top-[100px] md:top-[130px] lg:top-[177px] transform -translate-x-1/2 lg:transform-none">
                <span>
                  <span className="whitespace-nowrap bg-[rgba(44,160,255,1.00)] bg-clip-text text-transparent text-[20px] sm:text-[28px] md:text-[36px] lg:text-[48px] font-bold" style={{ fontFamily: "Inter" }}>
                    24/7
                  </span>
                  <span className="whitespace-nowrap bg-black bg-clip-text text-transparent text-[20px] sm:text-[28px] md:text-[36px] lg:text-[48px] font-bold" style={{ fontFamily: "Inter" }}>
                    학습,
                  </span>
                </span>
              </span>
              
              <span className="flex justify-center lg:justify-end text-center lg:text-right items-start h-auto w-full lg:w-[376px] absolute left-1/2 lg:left-[1240px] top-[110px] sm:top-[150px] md:top-[180px] lg:top-[265px] transform -translate-x-1/2 lg:transform-none">
                <span className="whitespace-nowrap bg-black bg-clip-text text-transparent text-[20px] sm:text-[28px] md:text-[36px] lg:text-[48px] font-bold" style={{ fontFamily: "Inter" }}>
                  당신만을 위한 공간
                </span>
              </span>
            </div>

            {/* 학습 대시보드 섹션 - 완전 반응형 */}
            <div className="relative mt-[150px] sm:mt-[200px] md:mt-[280px] lg:mt-[350px] mx-auto max-w-[1200px] p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* 왼쪽 스마트폰 이미지 - 반응형 */}
                <div className="relative order-2 lg:order-1">
                  <img 
                    src="/phone2.png" 
                    alt="스마트폰 화면" 
                    className="w-[60%] sm:w-[70%] md:w-[80%] lg:w-[90%] max-w-[250px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[472px] mx-auto"
                  />
                </div>

                {/* 오른쪽 실시간 학습률 대시보드 - 반응형 */}
                <div className="order-1 lg:order-2">
                  <h3 className="text-[16px] sm:text-[18px] md:text-[20px] lg:text-[24px] font-bold mb-4 lg:mb-6" style={{ fontFamily: "Inter" }}>📊 실시간 학습률 대시보드</h3>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
                    <div className="bg-[rgba(248,248,248,1.00)] p-2 sm:p-3 lg:p-4 rounded-lg transform transition-all duration-300 hover:scale-105">
                      <h4 className="text-[rgba(44,160,255,1.00)] text-[18px] sm:text-[22px] md:text-[26px] lg:text-[32px] font-bold text-center transition-all duration-500" style={{ fontFamily: "Inter" }}>{studyRate}%</h4>
                      <p className="text-[rgba(102,102,102,1.00)] text-[8px] sm:text-[10px] md:text-[12px] lg:text-[14px] text-center" style={{ fontFamily: "Inter" }}>전체 학습률</p>
                    </div>
                    <div className="bg-[rgba(248,248,248,1.00)] p-2 sm:p-3 lg:p-4 rounded-lg transform transition-all duration-300 hover:scale-105">
                      <h4 className="text-[rgba(255,129,129,1.00)] text-[18px] sm:text-[22px] md:text-[26px] lg:text-[32px] font-bold text-center transition-all duration-500" style={{ fontFamily: "Inter" }}>{todayTime}분</h4>
                      <p className="text-[rgba(102,102,102,1.00)] text-[8px] sm:text-[10px] md:text-[12px] lg:text-[14px] text-center" style={{ fontFamily: "Inter" }}>오늘 학습시간</p>
                    </div>
                    <div className="bg-[rgba(248,248,248,1.00)] p-2 sm:p-3 lg:p-4 rounded-lg transform transition-all duration-300 hover:scale-105">
                      <h4 className="text-[rgba(44,160,255,1.00)] text-[18px] sm:text-[22px] md:text-[26px] lg:text-[32px] font-bold text-center transition-all duration-500" style={{ fontFamily: "Inter" }}>{correctRate}%</h4>
                      <p className="text-[rgba(102,102,102,1.00)] text-[8px] sm:text-[10px] md:text-[12px] lg:text-[14px] text-center" style={{ fontFamily: "Inter" }}>정답률</p>
                    </div>
                    <div className="bg-[rgba(248,248,248,1.00)] p-2 sm:p-3 lg:p-4 rounded-lg transform transition-all duration-300 hover:scale-105">
                      <h4 className="text-black text-[18px] sm:text-[22px] md:text-[26px] lg:text-[32px] font-bold text-center transition-all duration-500" style={{ fontFamily: "Inter" }}>{continuousDays}일</h4>
                      <p className="text-[rgba(102,102,102,1.00)] text-[8px] sm:text-[10px] md:text-[12px] lg:text-[14px] text-center" style={{ fontFamily: "Inter" }}>연속 학습</p>
                    </div>
                  </div>

                  {/* 주간 학습 목표 진행률 - 반응형 */}
                  <div className="bg-[rgba(248,248,248,1.00)] p-2 sm:p-3 lg:p-4 rounded-lg mb-4 lg:mb-6">
                    <h4 className="text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] font-bold mb-2" style={{ fontFamily: "Inter" }}>주간 학습 목표</h4>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[14px] text-[rgba(102,102,102,1.00)]" style={{ fontFamily: "Inter" }}>이번 주 진행률</span>
                      <span className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-[14px] text-[rgba(44,160,255,1.00)] font-bold" style={{ fontFamily: "Inter" }}>16/20일</span>
                    </div>
                    <div className="h-2 sm:h-2.5 lg:h-3 bg-[rgba(224,224,224,1.00)] rounded-full">
                      <div 
                        className="h-2 sm:h-2.5 lg:h-3 bg-[rgba(44,160,255,1.00)] rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                    </div>
                    <p className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] text-[rgba(136,136,136,1.00)] mt-2" style={{ fontFamily: "Inter" }}>목표 달성까지 4일 남았습니다!</p>
                  </div>

                  {/* 주간 학습 패턴 - 반응형 */}
                  <div className="bg-white border rounded-xl border-[#e0e0e0] p-2 sm:p-3 md:p-4 lg:p-5 mt-4 lg:mt-6">
                    <h4 className="text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] font-bold mb-3 lg:mb-4" style={{ fontFamily: "Inter" }}>📈 주간 학습 패턴</h4>
                    <div className="flex justify-between items-end h-[50px] sm:h-[60px] md:h-[80px] lg:h-[100px] mb-2">
                      {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-[rgba(102,102,102,1.00)]" style={{ fontFamily: "Inter" }}>{day}</span>
                          <div className="w-[15px] sm:w-[20px] md:w-[30px] lg:w-[40px] h-[40px] sm:h-[50px] md:h-[65px] lg:h-[80px] bg-[rgba(224,224,224,1.00)] relative rounded-[3px]">
                            <div 
                              className={`w-[15px] sm:w-[20px] md:w-[30px] lg:w-[40px] absolute bottom-0 rounded-[3px] ${index < 5 ? 'bg-[rgba(44,160,255,1.00)]' : 'bg-[rgba(255,129,129,1.00)]'}`} 
                              style={{
                                height: `${(barWidths[index] * 0.5) + (barWidths[index] * 0.1 * (window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : window.innerWidth > 640 ? 1 : 0))}px`,
                                transition: 'height 1s ease-out'
                              }}
                            ></div>
                          </div>
                          <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] text-[rgba(102,102,102,1.00)]" style={{ fontFamily: "Inter" }}>
                            {['3h', '4h', '2.5h', '4.5h', '3.5h', '1.5h', '1h'][index]}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] text-[rgba(102,102,102,1.00)]" style={{ fontFamily: "Inter" }}>
                      주중 학습량이 주말보다 높습니다. 꾸준한 패턴을 유지하고 있어요! 👍
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 국내 최초 섹션 - 반응형 */}
          <div className="absolute w-full left-0 top-[1200px] sm:top-[1600px] md:top-[1900px] lg:top-[2130px]">
            <div className="max-w-4xl mx-auto text-center p-4 sm:p-6">
              <h2 className="text-[24px] sm:text-[32px] md:text-[40px] lg:text-[48px] font-normal mb-4 sm:mb-6 leading-tight" style={{ fontFamily: "AppleSDGothicNeoB00" }}>
                국내 최초<br />
                대학생 교육 플랫폼
              </h2>
              <p className="text-[14px] sm:text-[16px] md:text-[20px] lg:text-[24px] font-normal mb-8 sm:mb-10 lg:mb-12 leading-relaxed" style={{ fontFamily: "AppleSDGothicNeoR00" }}>
                경복대를 시작으로 전국 모든 대학에서<br />
                캠퍼스온을 사용하고 있어요.
              </p>

              {/* 통계 박스들 - 반응형 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[rgba(240,240,240,1.00)] p-2 sm:p-3 lg:p-4 rounded-[12px] sm:rounded-[14px]">
                  <p className="text-[10px] sm:text-[12px] md:text-[13px] lg:text-[15px] font-normal mb-1" style={{ fontFamily: "AppleSDGothicNeoB00" }}>가입 대학생</p>
                  <h4 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">10,000+</h4>
                </div>
                <div className="bg-[rgba(240,240,240,1.00)] p-2 sm:p-3 lg:p-4 rounded-[12px] sm:rounded-[14px]">
                  <p className="text-[10px] sm:text-[12px] md:text-[13px] lg:text-[15px] font-normal mb-1" style={{ fontFamily: "AppleSDGothicNeoB00" }}>강의 수</p>
                  <h4 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">500+</h4>
                </div>
                <div className="bg-[rgba(240,240,240,1.00)] p-2 sm:p-3 lg:p-4 rounded-[12px] sm:rounded-[14px]">
                  <p className="text-[10px] sm:text-[12px] md:text-[13px] lg:text-[15px] font-normal mb-1" style={{ fontFamily: "AppleSDGothicNeoB00" }}>문제 수</p>
                  <h4 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">20,000+</h4>
                </div>
                <div className="bg-[rgba(240,240,240,1.00)] p-2 sm:p-3 lg:p-4 rounded-[12px] sm:rounded-[14px]">
                  <p className="text-[10px] sm:text-[12px] md:text-[13px] lg:text-[15px] font-normal mb-1" style={{ fontFamily: "AppleSDGothicNeoB00" }}>교수 수</p>
                  <h4 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold">300+</h4>
                </div>
              </div>
            </div>

            {/* 푸터 - 반응형 */}
            <div className="bg-[rgba(240,240,240,1.00)] h-auto lg:h-[392px] w-full mt-[30px] sm:mt-[40px] lg:mt-[50px]">
              <div className="max-w-4xl mx-auto text-center py-6 sm:py-8 lg:py-10">
                <p className="text-xs sm:text-sm text-gray-600">© 2025 캠퍼스온 학습시스템</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일용 추가 콘텐츠 */}
      <div className="block lg:hidden w-full bg-[rgba(240,240,240,1.00)] mt-[1400px] sm:mt-[1800px]">
        <div className="p-4">
          <div className="flex gap-3 justify-center mb-8">
            <button className="bg-[rgba(40,40,40,1.00)] text-white px-3 py-2 rounded-[10px] text-sm">App Store</button>
            <button className="bg-[rgba(40,40,40,1.00)] text-white px-3 py-2 rounded-[10px] text-sm">Google Play</button>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-[18px] sm:text-[20px] md:text-[24px] font-bold mb-2">
              <span className="text-[rgba(255,129,129,1.00)]">24/7</span> 소통,
            </h2>
            <h2 className="text-[18px] sm:text-[20px] md:text-[24px] font-bold mb-2">
              <span className="text-[rgba(44,160,255,1.00)]">24/7</span> 학습,
            </h2>
            <h2 className="text-[18px] sm:text-[20px] md:text-[24px] font-bold">당신만을 위한 공간</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Desktopmain;

