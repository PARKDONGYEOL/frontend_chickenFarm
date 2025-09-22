import React, { useEffect, useState } from 'react'
import styles from './AdminSideMenu.module.css'
import { NavLink, useNavigate } from 'react-router-dom'

const AdminSideMenu = () => {
  const [loginInfo, setLoginInfo] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const storedInfo = sessionStorage.getItem('loginInfo');
    if (storedInfo) {
      setLoginInfo(JSON.parse(storedInfo));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('loginInfo');
    setLoginInfo(null);
    alert("로그아웃 되었습니다.");
    nav('/login');
  };

  return (
    <aside className={styles.admin_sidebar}>
      <div className={styles.admin_sidebar__header}>
        <div className={styles.admin_sidebar__logo}>Sitemark-web</div>
        <div className={styles.admin_sidebar__subtitle}>Web app</div>
      </div>

      <nav className={styles.admin_sidebar__nav}>
        <ul>
          <li>
            <NavLink to="/admin/pfm" className={({ isActive }) => isActive ? styles.active : undefined}>
              <span>📋</span><span>실시간 정보</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/daily" className={({ isActive }) => isActive ? styles.active : undefined}>
              <span>📋</span><span>일일 정보</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/weekly" className={({ isActive }) => isActive ? styles.active : undefined}>
              <span>📋</span><span>주간 정보</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/entity" className={({ isActive }) => isActive ? styles.active : undefined}>
              <span>📋</span><span>개체 관리</span>
            </NavLink>
          </li>
          <li>
            <span>📋</span><span>CCTV</span>
          </li>
        </ul>
      </nav>

      {/* 👇 사용자 프로필 박스 + 드롭다운 */}
      {loginInfo && (
        <div className={styles.userMenuWrapper}>
          <div
            className={styles.userMenuTrigger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${loginInfo.name}&background=166534&color=fff`}
              alt="프로필"
              className={styles.userAvatar}
            />
            <span className={styles.userName}>{loginInfo.name}</span>
            <span className={styles.moreIcon}>⋮</span> {/* 세로 점 3개 아이콘 */}
          </div>

          {menuOpen && (
            <div className={styles.userDropdown}>
              <button onClick={handleLogout}>로그아웃</button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

export default AdminSideMenu