import React from 'react'
import styles from './AdminHeader.module.css'

const AdminHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.backButton}>&lt; Back to Home</div>
    </header>
  );
};

export default AdminHeader