import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import styles from "./Home.module.css";

const Home = () => {
  const nav = useNavigate();
  const location = useLocation(); // ✅ 현재 경로 가져오기
  const [loginInfo, setLoginInfo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const info = sessionStorage.getItem("loginInfo");
    if (info) {
      setLoginInfo(JSON.parse(info));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("loginInfo");
    setLoginInfo(null);
    nav("/"); // 로그인 페이지로 이동
  };

  // ✅ 홈 기본 화면 여부 체크
  const isHomeRoot = location.pathname === "/home";

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>🐓 SmartFarm</div>
        <nav className={styles.nav}>
          <span onClick={() => nav("/home/pfm")}>실시간 정보</span>
          <span onClick={() => nav("/home/daily")}>일일 데이터</span>
          <span onClick={() => nav("/home/weekly")}>주간 데이터</span>
          <span>CCTV</span>

          {loginInfo ? (
            <div className={styles.userMenuWrapper}>
              <div
                className={styles.userMenuTrigger}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${loginInfo.name}&background=4caf50&color=fff`}
                  alt="프로필"
                  className={styles.userAvatar}
                />
                <span className={styles.userName}>{loginInfo.name}</span>
                <span className={styles.moreIcon}>⋮</span>
              </div>

              {menuOpen && (
                <div className={styles.userDropdown}>
                  <button onClick={handleLogout}>로그아웃</button>
                </div>
              )}
            </div>
          ) : (
            <span onClick={() => nav("/login")}>로그인</span>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          {isHomeRoot ? (
            <>
              <h1>자연과 함께하는 스마트 양계 관리</h1>
              <p>친환경적이고 체계적인 데이터 기반 솔루션</p>
            </>
          ) : (
            <Outlet /> // ✅ 서브 라우트일 경우에는 Outlet만 출력
          )}
        </div>
      </section>
    </div>
  );
};

export default Home