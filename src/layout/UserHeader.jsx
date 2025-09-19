import React, { useState } from 'react'
import styles from './UserHeader.module.css'
import { useNavigate } from 'react-router-dom';

const UserHeader = () => {

  const nav = useNavigate();

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const submenu = [
    { title: "등록", items: ["상품 등록", "회원 등록", "이벤트 등록"] },
    { title: "조회", items: ["상품 조회", "회원 조회"] },
    { title: "제어", items: ["접근 제어", "기기 제어"] },
    { title: "보안", items: ["비밀번호 변경", "CCTV"] },
  ];

  const loginInfo = sessionStorage.getItem('loginInfo');

  const loginDate = JSON.parse(loginInfo);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.imageArea}>
          <img src="33003.jpg" alt="" className={styles.bannerImage} />
  
          {/* 배너 위에 올릴 로그인 영역 */}
          <div className={styles.bannerTextArea}>
            {
              !loginInfo ? (
                <>
                  <span 
                    className={styles.login}
                    onClick={() => nav('login')}
                   >로그인</span>
                </>
              ) : (
                <>
                  <span>{loginDate.memId}님 반갑습니다.</span>
                  <span 
                    className={styles.mypage}
                    onClick={() => nav('/admin')}
                  >마이페이지</span>
                </>
              )
            }
          </div>
        </div>
      </div>

      <div className={styles.menu}>
        {submenu.map((menu, i) => (
          <div
            key={i}
            className={styles.menuItem}

            // 사용자가 특정 메뉴(menuItem) 위에 마우스를 올렸을 때 실행
            // setHoveredIndex(i)를 호출 → 현재 마우스를 올린 메뉴의 **인덱스(i)**를 상태(hoveredIndex)에 저장
            onMouseEnter={() => setHoveredIndex(i)}

            // 사용자가 해당 메뉴에서 마우스를 뗄 때 실행
            // setHoveredIndex(null)을 호출 → hoveredIndex를 null로 초기화
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