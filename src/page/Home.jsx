import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import styles from "./Home.module.css";
import Header from "../layout/Header";
import ModalFull from "../common/ModalFull"; //추가 cctv
import TourGuide from "../common/TourGuide";
import roosterImg from "../assets/rooster-285432_1280.jpg";
import image1 from "../assets/image.png";
import image2 from "../assets/image copy.png";
import image3 from "../assets/image copy 2.png";
import image4 from "../assets/image copy 3.png";


const Home = () => {
  const location = useLocation();
  const isHomeRoot = location.pathname === "/home";
  const [isCctvModalOpen, setCctvModalOpen] = useState(false); //추가 cctv
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);

  const startTour = () => {
    // 헤더 메뉴 위치 계산
    const menuItems = document.querySelectorAll('header [class*="head_list"] > div');

    const steps = [];

    menuItems.forEach((item, index) => {
      // 마지막 항목(가이드)은 제외
      if (index === 4) return;

      const rect = item.getBoundingClientRect();
      const titles = ["통계 페이지", "실시간 모니터링", "통합관리", "개체관리"];
      const descriptions = [
        "주간 데이터와 통계를 확인할 수 있습니다.\n양계장의 온도, 습도, 사료 소비량 등을 차트로 볼 수 있습니다.",
        "실시간으로 양계장의 상태를 모니터링합니다.\n일일 데이터를 확인하고 즉각적인 대응이 가능합니다.",
        "양계장 전체를 통합 관리하는 페이지입니다.\n설정 변경 및 시스템 관리를 할 수 있습니다.",
        "닭 개체별 정보를 관리합니다.\n개체 등록, 현황 조회, 건강 상태 확인 등을 할 수 있습니다."
      ];

      // 설명 박스 위치를 각 단계마다 다르게 배치
      let tooltipX, tooltipY;

      if (index === 0) {
        // 첫 번째 (통계)
        tooltipX = window.innerWidth * 0.40;
        tooltipY = window.innerHeight * 0.2;
      } else if (index === 1) {
        // 두 번째 (실시간)
        tooltipX = window.innerWidth * 0.45;
        tooltipY = window.innerHeight * 0.2;
      } else if (index === 2) {
        // 세 번째 (통합관리)
        tooltipX = window.innerWidth * 0.50;
        tooltipY = window.innerHeight * 0.2;
      } else {
        // 네 번째 (개체관리)
        tooltipX = window.innerWidth * 0.55;
        tooltipY = window.innerHeight * 0.2;
      }

      // 타겟 요소의 중심점
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
        // 화살표 좌표 (설명 박스 오른쪽 → 메뉴 항목)
        arrowStart: {
          x: tooltipX + 300, // 설명 박스 오른쪽 끝 (간격 증가)
          y: tooltipY + 50,
        },
        arrowEnd: {
          x: targetCenterX - 30, // 메뉴 항목에서 더 떨어뜨림
          y: targetCenterY + 12,
        }
      });
    });

    setTourSteps(steps);
    setIsTourOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* 상단 헤더 */}
      <Header onGuideClick={startTour} />

      {/* 메인 레이아웃 */}
      <div className={styles.mainLayout}>
        {/* ✅ 메인 콘텐츠 */}
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
            <Outlet /> // 서브 라우트 내용 표시
          )}

        </div>
      </div>

      {/* 투어 가이드 */}
      <TourGuide
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        steps={tourSteps}
      />
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