import { useState, useEffect } from 'react';

// 브레이크포인트 정의
const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  xl: 1280,
  xxl: 1440
};

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기값 설정

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < breakpoints.tablet;
  const isTablet = windowSize.width >= breakpoints.tablet && windowSize.width < breakpoints.desktop;
  const isDesktop = windowSize.width >= breakpoints.desktop && windowSize.width < breakpoints.xl;
  const isXl = windowSize.width >= breakpoints.xl && windowSize.width < breakpoints.xxl;
  const isXxl = windowSize.width >= breakpoints.xxl;

  // 반응형 값을 반환하는 함수
  const responsive = (mobileValue, tabletValue, desktopValue, xlValue, xxlValue) => {
    if (isMobile) return mobileValue;
    if (isTablet) return tabletValue || mobileValue;
    if (isDesktop) return desktopValue || tabletValue || mobileValue;
    if (isXl) return xlValue || desktopValue || tabletValue || mobileValue;
    if (isXxl) return xxlValue || xlValue || desktopValue || tabletValue || mobileValue;
    return mobileValue;
  };

  // 반응형 스타일 생성 함수
  const getResponsiveStyle = (styles) => {
    const currentStyle = {};
    
    if (isMobile && styles.mobile) {
      Object.assign(currentStyle, styles.mobile);
    }
    if (isTablet && styles.tablet) {
      Object.assign(currentStyle, styles.tablet);
    }
    if (isDesktop && styles.desktop) {
      Object.assign(currentStyle, styles.desktop);
    }
    if (isXl && styles.xl) {
      Object.assign(currentStyle, styles.xl);
    }
    if (isXxl && styles.xxl) {
      Object.assign(currentStyle, styles.xxl);
    }

    return currentStyle;
  };

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isXl,
    isXxl,
    responsive,
    getResponsiveStyle,
    breakpoints
  };
};

export default useResponsive; 