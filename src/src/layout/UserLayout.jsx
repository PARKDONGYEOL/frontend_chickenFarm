import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserLayout() {
  const { logout } = useAuth();

  return (
    <div>
      <header>
        <nav>
          <Link to="/">홈</Link> |{" "}
          <Link to="/monitoring">모니터링</Link> |{" "}
          <Link to="/control">제어</Link> |{" "}
          <Link to="/users">사용자 관리</Link> |{" "}
          <Link to="/about">소개</Link> |{" "}
          <button onClick={logout}>로그아웃</button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}