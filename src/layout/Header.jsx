import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import styles from "./Header.module.css";

const Header = ({ onGuideClick, currentPath }) => {
  const nav = useNavigate();
  const [loginInfo, setLoginInfo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [integratedMenuOpen, setIntegratedMenuOpen] = useState(false);

  useEffect(() => {
    const info = sessionStorage.getItem("loginInfo");
    if (info) setLoginInfo(JSON.parse(info));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("loginInfo");
    setLoginInfo(null);
    nav("/");
  };

  // 현재 경로가 해당 메뉴와 일치하는지 확인
  const isActive = (path) => {
    return currentPath?.startsWith(path);
  };

  // 통합관리 하위 메뉴인지 확인
  const isIntegratedActive = () => {
    return currentPath?.startsWith("/home/cctv") || 
           currentPath?.startsWith("/home/diary") || 
           currentPath?.startsWith("/home/inoculation") ||
           currentPath?.startsWith("/home/alert-history") ||
           currentPath?.startsWith("/home/env-settings");
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
            <div 
              onClick={() => nav("/home/env")}
              className={isActive("/home/env") ? styles.active : ""}
            >
              통계
            </div>
            <div 
              onClick={() => nav("/home/real")}
              className={isActive("/home/real") ? styles.active : ""}
            >
              실시간
            </div>
            <div
              className={`${styles.integratedMenu} ${isIntegratedActive() ? styles.active : ""}`}
              onMouseEnter={() => setIntegratedMenuOpen(true)}
              onMouseLeave={() => setIntegratedMenuOpen(false)}
            >
              통합관리
              {integratedMenuOpen && (
                <div className={styles.integratedDropdown}>
                  <div onClick={() => nav("/home/cctv")}>CCTV</div>
                  <div onClick={() => nav("/home/diary")}>관찰일지</div>
                  <div onClick={() => nav("/home/inoculation")}>예방접종</div>
                  <div onClick={() => nav("/home/alert-history")}>알림기록</div>
                  <div onClick={() => nav("/home/env-settings")}>환경설정</div>
                </div>
              )}
            </div>
            <div 
              onClick={() => nav("/home/chickenmanagement")}
              className={isActive("/home/chickenmanagement") ? styles.active : ""}
            >
              개체관리
            </div>
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
              <button className={styles.settingsButton} onClick={() => nav("/settings")}>
                <FaCog className={styles.buttonIcon} />
                설정
              </button>
              <button className={styles.logoutButton} onClick={handleLogout}>
                <FaSignOutAlt className={styles.buttonIcon} />
                로그아웃
              </button>
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