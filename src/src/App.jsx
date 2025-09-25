import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import UserLayout from "./layout/UserLayout";
import AdminLayout from "./layout/AdminLayout";

import Home from "./pages/Home";
import Monitoring from "./pages/Monitoring";
import Control from "./pages/Control";
import Users from "./pages/Users";
import About from "./pages/About";

import DailyInfo from "./pages/DailyInfo";
import WeeklyInfo from "./pages/WeeklyInfo";
import EntityManagement from "./pages/EntityManagement";
import PoultryFarmManagement from "./pages/PoultryFarmManagement";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* 사용자 영역 */}
      <Route path="/" element={user ? <UserLayout /> : <Navigate to="/login" />}>
        <Route index element={<Home />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="control" element={<Control />} />
        <Route path="users" element={<Users />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* 관리자 영역 */}
      <Route
        path="/admin"
        element={user && user.role === "admin" ? <AdminLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<PoultryFarmManagement />} />
        <Route path="daily" element={<DailyInfo />} />
        <Route path="weekly" element={<WeeklyInfo />} />
        <Route path="entity" element={<EntityManagement />} />
      </Route>
    </Routes>
  );
}

export default App;