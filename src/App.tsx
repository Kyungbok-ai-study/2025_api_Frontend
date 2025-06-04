import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// @ts-ignore
import Desktopmain from "./pages/HomePage.jsx";
// @ts-ignore
import Login from "./pages/Login.jsx";
// @ts-ignore
import Dashboard from "./pages/Dashboard.jsx";
// @ts-ignore
import StudentDashboard from "./pages/student/Dashboard.jsx";
// @ts-ignore
import ProfessorDashboard from "./pages/professor/Dashboard.jsx";
// @ts-ignore
import MyPage from "./pages/my/MyPage.jsx";
// 회원가입 페이지들
// @ts-ignore
import RegisterStep1 from "./pages/register/index.jsx";
// @ts-ignore
import RegisterStep2 from "./pages/register/dept.jsx";
// @ts-ignore
import RegisterStep3 from "./pages/register/agreement.jsx";
// @ts-ignore
import RegisterStep4 from "./pages/register/create.jsx";
// @ts-ignore
import RegisterSuccess from "./pages/register/success.jsx";
// @ts-ignore
import RoleBasedDashboard from "./components/RoleBasedDashboard.jsx";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
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
      </Routes>
    </Router>
  );
};

export default App;
