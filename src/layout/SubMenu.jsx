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
            {/* ✅ 상위 메뉴 */}
            <div
              className={styles.parent}
              onClick={() =>
                item.children ? handleToggle(item.label) : item.onClick?.()
              }
            >
              {/* to가 있으면 NavLink, 없으면 span */}
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
                <span
                  className={styles.link}
                  onClick={item.onClick} // ✅ 여기도 직접 연결 (CCTV 같은 메뉴용)
                  role="button"
                  tabIndex={0}
                >
                  {item.label}
                </span>
              )}

              {/* ▼/▲ 화살표 */}
              {item.children && (
                <span className={styles.arrow}>
                  {openItem === item.label ? "▲" : "▼"}
                </span>
              )}
            </div>

            {/* ✅ 서브 메뉴 */}
            {item.children && openItem === item.label && (
              <div className={styles.subMenu}>
                {item.children.map((sub) =>
                  sub.to ? (
                    <NavLink
                      key={sub.label}
                      to={sub.to}
                      className={({ isActive }) =>
                        `${styles.subLink} ${isActive ? styles.active : ""}`
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ) : (
                    <span
                      key={sub.label}
                      className={styles.subLink}
                      onClick={sub.onClick}
                      role="button"
                      tabIndex={0}
                    >
                      {sub.label}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SubMenu;
