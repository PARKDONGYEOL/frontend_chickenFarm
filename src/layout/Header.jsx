import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import styles from "./Header.module.css";

const Header = ({ onGuideClick }) => {
  const nav = useNavigate();
  const [loginInfo, setLoginInfo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const info = sessionStorage.getItem("loginInfo");
    if (info) setLoginInfo(JSON.parse(info));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("loginInfo");
    setLoginInfo(null);
    nav("/");
  };

  return (
    <header className={styles.header}>
      {/* 로고 */}
      <div className={styles.logoWrapper}>
        <div
          className={styles.logo}
          onClick={() => {
            nav("/home");
          }}
        >
          <p>SmartFarm</p>
        </div>
      </div>

      {/* 오른쪽: 로그인/유저메뉴 */}
      {loginInfo ? (
        <div className={styles.userMenuWrapper}>
          <div className={styles.head_list}>
            <div onClick={() => nav("/home/weekly")}>통계</div>
            <div onClick={() => nav("/home/daily")}>실시간</div>
            <div onClick={() => nav("/home/pfm")}>통합관리</div>
            <div onClick={() => nav("/home/chickenmanagement")}>개체관리</div>
            <div onClick={onGuideClick} className={styles.guideMenu}>가이드</div>
          </div>
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
              <button onClick={() => nav("/settings")}>설정</button>
              <button onClick={handleLogout}>로그아웃</button>
            </div>
          )}
        </div>
      ) : (
        <span onClick={() => nav("/login")}>로그인</span>
      )}
    </header>
  );
};

export default Header;