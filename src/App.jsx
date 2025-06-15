import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Desktopmain from "./pages/HomePage.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import DiagnosticTest from "./pages/student/DiagnosticTest.jsx";
import LearningAnalysis from "./pages/student/LearningAnalysis.jsx";
import ProfessorDashboard from "./pages/professor/Dashboard.jsx";
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import MyPage from "./pages/my/MyPage.jsx";
// 회원가입 페이지들
import RegisterStep1 from "./pages/register/index.jsx";
import RegisterStep2 from "./pages/register/dept.jsx";
import RegisterStep3 from "./pages/register/agreement.jsx";
import RegisterStep4 from "./pages/register/create.jsx";
import RegisterSuccess from "./pages/register/success.jsx";
import RoleBasedDashboard from "./components/RoleBasedDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
// 교수용 페이지들
import RAGUpdate from "./pages/professor/RAGUpdate.jsx";
import QuestionReview from "./pages/professor/QuestionReview.jsx";
import ProfessorIndex from "./pages/professor/index.jsx";
import Reports from "./pages/professor/Reports.jsx";
import Monitoring from "./pages/professor/Monitoring.jsx";
import Analytics from "./pages/professor/Analytics.jsx";
import StudentList from "./pages/professor/StudentList.jsx";
import AssignmentManagement from "./pages/professor/AssignmentManagement.jsx";
import ProblemGeneration from "./pages/professor/ProblemManagement.jsx";

import "./App.css";

const App = () => {
  return (
    <Router>
        <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<Desktopmain />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        <Route path="/my" element={<MyPage />} />
          
        {/* 회원가입 라우트들 */}
        <Route path="/register" element={<RegisterStep1 />} />
        <Route path="/register/dept" element={<RegisterStep2 />} />
        <Route path="/register/agreement" element={<RegisterStep3 />} />
        <Route path="/register/create" element={<RegisterStep4 />} />
          <Route path="/register/success" element={<RegisterSuccess />} />
          
        {/* 학생용 라우트들 - 구체적인 라우트를 먼저 배치 */}
        <Route path="/student/analysis/:testId" element={<ProtectedRoute><LearningAnalysis /></ProtectedRoute>} />
        <Route path="/student/analysis" element={<ProtectedRoute><LearningAnalysis /></ProtectedRoute>} />
        <Route path="/student/diagnosis/:subject" element={<DiagnosticTest />} />
        <Route path="/student/diagnosis" element={<DiagnosticTest />} />
        <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/problems/:subject" element={<StudentDashboard />} />
        <Route path="/student/problems" element={<StudentDashboard />} />
        <Route path="/student/results/:testId" element={<StudentDashboard />} />
        <Route path="/student/results" element={<StudentDashboard />} />
        <Route path="/student/learning" element={<StudentDashboard />} />
        <Route path="/student/assignments" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<StudentDashboard />} />
        <Route path="/diagnosis" element={<DiagnosticTest />} />
        <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          
        {/* 교수용 라우트들 */}
          <Route path="/professor" element={<ProfessorDashboard />} />
        <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
        <Route path="/professor/rag-update" element={<RAGUpdate />} />
        <Route path="/professor/question-review" element={<QuestionReview />} />
        <Route path="/professor/question-review/:questionId" element={<QuestionReview />} />
        <Route path="/professor/reports" element={<Reports />} />
        <Route path="/professor/reports/:reportType" element={<Reports />} />
        <Route path="/professor/monitoring" element={<Monitoring />} />
        <Route path="/professor/monitoring/:studentId" element={<Monitoring />} />
        <Route path="/professor/analytics" element={<Analytics />} />
        <Route path="/professor/analytics/:subject" element={<Analytics />} />
        <Route path="/professor/students" element={<StudentList />} />
        <Route path="/professor/students/:studentId" element={<StudentList />} />
        <Route path="/professor/assignments" element={<AssignmentManagement />} />
        <Route path="/professor/assignments/:assignmentId" element={<AssignmentManagement />} />
        <Route path="/professor/problems" element={<ProblemGeneration />} />
        <Route path="/professor/problems/:problemId" element={<ProblemGeneration />} />

        <Route path="/professor/upload" element={<ProfessorDashboard />} />
        <Route path="/professor/settings" element={<ProfessorDashboard />} />
          
        {/* 관리자용 라우트들 */}
          <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/admin/users" element={<AdminDashboard />} />
        <Route path="/admin/users/:userId" element={<AdminDashboard />} />
        <Route path="/admin/professors" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminDashboard />} />
        <Route path="/admin/system" element={<AdminDashboard />} />
        <Route path="/admin/reports" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AdminDashboard />} />
        <Route path="/admin/logs" element={<AdminDashboard />} />
        
        {/* API 및 테스트 관련 라우트들 */}
        <Route path="/api/*" element={<Desktopmain />} />
        <Route path="/test/:testId" element={<RoleBasedDashboard />} />
        <Route path="/results/:resultId" element={<RoleBasedDashboard />} />
        
        {/* 보호된 라우트들 */}
        <Route path="/protected/*" element={<RoleBasedDashboard />} />
        
        {/* 404 및 기타 라우트들 */}
        <Route path="/404" element={<Desktopmain />} />
        <Route path="/unauthorized" element={<Desktopmain />} />
        <Route path="/maintenance" element={<Desktopmain />} />
        
        {/* 모든 매치되지 않는 라우트를 홈페이지로 리다이렉트 */}
        <Route path="*" element={<Desktopmain />} />
        </Routes>
    </Router>
  );
};

export default App; 