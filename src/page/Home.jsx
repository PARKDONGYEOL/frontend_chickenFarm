import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./Home.module.css";
import Header from "../layout/Header";
import ModalFull from "../common/ModalFull";
import TourGuide from "../common/TourGuide";
import roosterImg from "../assets/rooster-285432_1280.jpg";


const Home = () => {
  const location = useLocation();
  const isHomeRoot = location.pathname === "/home";
  const [isCctvModalOpen, setCctvModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);

  const startTour = () => {
    const menuItems = document.querySelectorAll('header [class*="head_list"] > div');

    const steps = [];

    menuItems.forEach((item, index) => {
      if (index === 4) return;

      const rect = item.getBoundingClientRect();
      const titles = ["통계 페이지", "실시간 모니터링", "통합관리", "개체관리"];
      const descriptions = [
        "주간 데이터와 통계를 확인할 수 있습니다.\n양계장의 온도, 습도, 사료 소비량 등을 차트로 볼 수 있습니다.",
        "실시간으로 양계장의 상태를 모니터링합니다.\n일일 데이터를 확인하고 즉각적인 대응이 가능합니다.",
        "양계장 전체를 통합 관리하는 페이지입니다.\n설정 변경 및 시스템 관리를 할 수 있습니다.",
        "닭 개체별 정보를 관리합니다.\n개체 등록, 현황 조회, 건강 상태 확인 등을 할 수 있습니다."
      ];

      let tooltipX, tooltipY;

      if (index === 0) {
        tooltipX = window.innerWidth * 0.40;
        tooltipY = window.innerHeight * 0.2;
      } else if (index === 1) {
        tooltipX = window.innerWidth * 0.45;
        tooltipY = window.innerHeight * 0.2;
      } else if (index === 2) {
        tooltipX = window.innerWidth * 0.50;
        tooltipY = window.innerHeight * 0.2;
      } else {
        tooltipX = window.innerWidth * 0.55;
        tooltipY = window.innerHeight * 0.2;
      }

      const targetCenterX = rect.left + rect.width / 2;
      const targetCenterY = rect.top + rect.height / 2;

      steps.push({
        title: titles[index],
        description: descriptions[index],
        targetElement: {
          top: rect.top - 10,
          left: rect.left - 10,
          width: rect.width + 20,
          height: rect.height + 10,
        },
        tooltipPosition: {
          top: `${tooltipY}px`,
          left: `${tooltipX}px`,
        },
        arrowStart: {
          x: tooltipX + 300,
          y: tooltipY + 50,
        },
        arrowEnd: {
          x: targetCenterX - 30,
          y: targetCenterY + 12,
        }
      });
    });

    setTourSteps(steps);
    setIsTourOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* ✅ currentPath prop 추가 */}
      <Header onGuideClick={startTour} currentPath={location.pathname} />

      <div className={styles.mainLayout}>
        <div className={styles.content}>
          {isHomeRoot ? (
            <div className={styles.heroContent}>
              <img src={roosterImg} alt="Rooster" />
              <div className={styles.bannerText}>
                <p>Smart Chicken Farm</p>
                <p>team::dc.kim</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>

      <TourGuide
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        steps={tourSteps}
      />
      
      <ModalFull
        isOpen={isCctvModalOpen}
        onClose={() => setCctvModalOpen(false)}
        title="CCTV 모니터링"
      >
        <iframe
          src="http://192.168.30.71:5090"
          style={{ width: "100%", height: "100%", border: "none" }}
          title="CCTV Viewer"
        />
      </ModalFull>
    </div>
  );
};

export default Home;