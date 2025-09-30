import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./Home.module.css";
import Header from "../layout/Header";
import SubMenu from "../layout/SubMenu";
import ModalFull from "../common/ModalFull"; //추가 cctv
import roosterImg from "../assets/rooster-285432_1280.jpg";


const Home = () => {
  const location = useLocation();
  const isHomeRoot = location.pathname === "/home";
  const [sideOpen, setSideOpen] = useState(false);
  const [isCctvModalOpen, setCctvModalOpen] = useState(false); //추가 cctv

  return (
    <div className={styles.container}>
      {/* 상단 헤더 */}
      <Header toggleMenu={() => setSideOpen(!sideOpen)} />

      {/* 메인 레이아웃 */}
      <div className={styles.mainLayout}>
        {/* ✅ 사이드 서브메뉴 */}
        {sideOpen && (
          <div className={styles.sidebar}>
            <SubMenu
              items={[
                {
                  label: "모니터링",
                  children: [
                    { label: "실시간 정보", to: "/home/pfm" },
                    { label: "일일 데이터", to: "/home/daily" },
                    { label: "주간 데이터", to: "/home/weekly" },
                    {
                      label: "CCTV",
                      // ✅ 수정1: to 대신 onClick을 사용 (라우터 이동 없이 모달 열기)
                      onClick: () => setCctvModalOpen(true),
                    },
                  ],
                },
                {
                  label: "개체 관리",
                  children: [
                    { label: "개체 등록", to: "/home/entity/register" },
                    { label: "개체 현황", to: "/home/entity" },
                  ],
                },
              ]}
            />
          </div>
        )}

        {/* ✅ 메인 콘텐츠 */}
        <div
          className={`${styles.content} ${sideOpen ? styles.withSidebar : ""}`}
        >
          {isHomeRoot ? (
            <div className={styles.heroContent}>
              <img src={roosterImg} alt="Rooster" />
              <div className={styles.bannerText}>
                <p>SMART CHICKEN FARM</p>
                <p>team::dc.kim</p>
              </div>
            </div>
          ) : (
            <Outlet /> // 서브 라우트 내용 표시
          )}
        </div>
      </div>
      {/* ✅ CCTV 모달 */}
      <ModalFull
        isOpen={isCctvModalOpen}
        onClose={() => setCctvModalOpen(false)} // ✅ 수정2: 닫기 이벤트 연결
        title="CCTV 모니터링"
      >
        {/* ✅ 수정3: iframe 기본 속성 확실히 명시 */}
        <iframe
          src="http://192.168.30.71:5090"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="CCTV Viewer"
        />
      </ModalFull>     
    </div>
  );
};

export default Home