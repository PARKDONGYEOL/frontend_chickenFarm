import React from 'react'
import styles from './AdminHeader.module.css'
import { NavLink } from 'react-router-dom';

const AdminHeader = () => {
  return (
    <header className={styles.header}>
      <NavLink
        to="/" 
        className={styles.backButton}
      >
        <div className={styles.backButton}>
          &lt; Back to Home
        </div>
      </NavLink>
    </header>
  );
};

export default AdminHeader