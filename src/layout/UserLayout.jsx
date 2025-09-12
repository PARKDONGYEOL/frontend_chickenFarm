import React from 'react'
import { Outlet, Route, Routes } from 'react-router-dom'
import UserHeader from './UserHeader'
import styles from './UserLayout.module.css'

const UserLayout = () => {
  return (
    <div className={styles.container}>
      <div>
        <UserHeader/>
      </div>
    </div>
  )
}

export default UserLayout