import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div>
      <header>
        <nav>
          <Link to="/admin">농장 관리</Link> |{" "}
          <Link to="/admin/daily">일별 정보</Link> |{" "}
          <Link to="/admin/weekly">주간 정보</Link> |{" "}
          <Link to="/admin/entity">개체 관리</Link> |{" "}
          <button onClick={logout}>로그아웃</button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}