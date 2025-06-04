import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleBasedDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      const user = JSON.parse(userData);
      
      // 역할에 따라 적절한 대시보드로 리다이렉트
      switch (user.role) {
        case 'professor':
          navigate('/professor');
          break;
        case 'student':
          navigate('/student');
          break;
        case 'admin':
          navigate('/admin');
          break;
        case 'unverified':
        case null:
        case undefined:
        case '':
        default:
          // 미인증 사용자나 역할이 없는 경우 미인증 대시보드로
          navigate('/dashboard/unverified');
          break;
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">역할에 따른 대시보드로 이동 중...</p>
      </div>
    </div>
  );
};

export default RoleBasedDashboard; 