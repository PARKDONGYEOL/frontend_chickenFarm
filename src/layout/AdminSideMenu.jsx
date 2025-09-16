import React from 'react'
import styles from './AdminSideMenu.module.css'

const AdminSideMenu = () => {
  return (
    <aside className={styles.admin_sidebar}>
      <div className={styles.admin_sidebar__header}>
        <div className={styles.admin_sidebar__logo}>Sitemark-web</div>
        <div className={styles.admin_sidebar__subtitle}>Web app</div>
      </div>

      <nav className={styles.admin_sidebar__nav}>
        <ul>
          <li className={styles.active}>
            <span>📋</span>
            <span>양계장 상태</span>
          </li>
          <li>
            <span>📋</span>
            <span>양계 상태</span>
          </li>
          <li>
            <span>📋</span>
            <span>보안</span>
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