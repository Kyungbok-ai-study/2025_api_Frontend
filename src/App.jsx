import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// 회원가입 각 단계별 컴포넌트 import
import RegisterPage from './pages/register/index';
import RegisterDept from './pages/register/dept';
import RegisterAgreement from './pages/register/agreement';
import RegisterCreate from './pages/register/create';
import RegisterSuccess from './pages/register/success';

import MyPage from './pages/my/MyPage';
import RoleBasedDashboard from './pages/RoleBasedDashboard';
import Dashboard from './pages/Dashboard'; // 미인증 대시보드
import StudentDashboard from './pages/student/Dashboard'; // 학생 대시보드
import ProfessorDashboard from './pages/professor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard'; // 관리자 대시보드
import AssignmentManagement from './pages/professor/AssignmentManagement';
import ProblemManagement from './pages/professor/ProblemManagement';
import StudentList from './pages/professor/StudentList';
import Analytics from './pages/professor/Analytics';
import Monitoring from './pages/professor/Monitoring';
import Reports from './pages/professor/Reports';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 공통 페이지 */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* 회원가입 각 단계별 라우트 */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/dept" element={<RegisterDept />} />
          <Route path="/register/agreement" element={<RegisterAgreement />} />
          <Route path="/register/create" element={<RegisterCreate />} />
          <Route path="/register/success" element={<RegisterSuccess />} />
          
          {/* 마이페이지 */}
          <Route path="/my" element={<MyPage />} />
          
          {/* 역할별 대시보드 */}
          <Route path="/dashboard" element={<RoleBasedDashboard />} />
          <Route path="/dashboard/unverified" element={<Dashboard />} />
          
          {/* 학생 대시보드 */}
          <Route path="/student" element={<StudentDashboard />} />
          
          {/* 교수 전용 페이지 */}
          <Route path="/professor" element={<ProfessorDashboard />} />
          <Route path="/professor/assignments" element={<AssignmentManagement />} />
          <Route path="/professor/problems" element={<ProblemManagement />} />
          <Route path="/professor/students" element={<StudentList />} />
          <Route path="/professor/analytics" element={<Analytics />} />
          <Route path="/professor/monitoring" element={<Monitoring />} />
          <Route path="/professor/reports" element={<Reports />} />
          
          {/* 관리자 전용 페이지 */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* 기본 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 