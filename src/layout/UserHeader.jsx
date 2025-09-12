import React, { useState } from 'react'
import styles from './UserHeader.module.css'

const UserHeader = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const submenu = [
    { title: "등록", items: ["상품 등록", "회원 등록", "이벤트 등록"] },
    { title: "조회", items: ["상품 조회", "회원 조회"] },
    { title: "제어", items: ["접근 제어", "기기 제어"] },
    { title: "보안", items: ["비밀번호 변경", "접속 기록"] },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.logoArea}>
          <img src="병아리 그림.png" className={styles.img} />
          <div className={styles.userArea}>
            <span className={styles.login}>로그인</span>
            <span className={styles.mypage}>마이페이지</span>
          </div>
        </div>
      </div>

      <div className={styles.menu}>
        {submenu.map((menu, i) => (
          <div
            key={i}
            className={styles.menuItem}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className={styles.menuTitle}>{menu.title}</div>

            {hoveredIndex === i && (
              <ul className={styles.submenu}>
                {menu.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


export default UserHeader;