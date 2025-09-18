import React from 'react'
import styles from './AdminSideMenu.module.css'
import { NavLink } from 'react-router-dom'

const AdminSideMenu = () => {
  return (
    <aside className={styles.admin_sidebar}>
      <div className={styles.admin_sidebar__header}>
        <div className={styles.admin_sidebar__logo}>Sitemark-web</div>
        <div className={styles.admin_sidebar__subtitle}>Web app</div>
      </div>

      <nav className={styles.admin_sidebar__nav}>
        <ul>
          <li>
            <NavLink
              to="/admin/pfm" 
              className={({ isActive }) => isActive ? styles.active : undefined}
            >
              <span>📋</span>
              <span>실시간 정보</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/daily" 
              className={({ isActive }) => isActive ? styles.active : undefined}
            >
              <span>📋</span>
              <span>일일 정보</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin/weekly"
              className={({ isActive }) => isActive ? styles.active : undefined}
            >
              <span>📋</span>
              <span>주간 정보</span>
            </NavLink>
          </li>
          <li>
            <span>📋</span>
            <span>CCTV</span>
          </li>
        </ul>
      </nav>
    </aside>
  )
}

export default AdminSideMenu