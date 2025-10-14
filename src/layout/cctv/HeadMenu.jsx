import React from 'react';
import styles from './HeadMenu.module.css';
import { NavLink } from 'react-router-dom';

const menuItems = [
  { to: '/', menu: '홈' },
  { to: '/streaming', menu: '실시간확인' },
  { to: '/videos', menu: '동영상관리' },
  { to: '/alarms', menu: '알람관리' },
];

const HeadMenu = () => {
  return (
    <div className={styles.head_div}>
      {menuItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `${styles.menu_item} ${isActive ? styles.active : ''}`
          }
        >
          {item.menu}
        </NavLink>
      ))}
    </div>
  );
};

export default HeadMenu;
