import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./SubMenu.module.css";

const SubMenu = ({ items = [] }) => {
  const [openItem, setOpenItem] = useState(null);

  const handleToggle = (label) => {
    setOpenItem(openItem === label ? null : label);
  };

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.menu}>
        {items.map((item) => (
          <div key={item.label} className={styles.menuItem}>
            {/* 상위 메뉴 */}
            <div
              className={styles.parent}
              onClick={() => item.children ? handleToggle(item.label) : null}
            >
              {item.to ? (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.active : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <span className={styles.link}>{item.label}</span>
              )}
              {item.children && (
                <span className={styles.arrow}>
                  {openItem === item.label ? "▲" : "▼"}
                </span>
              )}
            </div>

            {/* 서브 메뉴 */}
            {item.children && openItem === item.label && (
              <div className={styles.subMenu}>
                {item.children.map((sub) => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    className={({ isActive }) =>
                      `${styles.subLink} ${isActive ? styles.active : ""}`
                    }
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SubMenu;