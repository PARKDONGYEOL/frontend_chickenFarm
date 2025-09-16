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
      <div className={styles.image_div}>
        <img 
          src="33003.jpg"
          alt="" 
          className={styles.backgroundImage}
        />
        <div className={styles.outlet_div}>
          <Outlet/>
        </div>
      </div>
      <div></div>
    </div>
  )
}

export default UserLayout