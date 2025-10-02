import React from "react";
import styles from "./CCTV.module.css";

const CCTV = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>CCTV 모니터링</h2>
        <p className={styles.subtitle}>실시간 영상 감시</p>
      </div>

      <div className={styles.videoGrid}>
        {/* CCTV 1 */}
        <div className={styles.videoCard}>
          <div className={styles.videoHeader}>
            <span className={styles.cameraName}>📹 카메라 1 - 입구</span>
            <span className={styles.status}>● LIVE</span>
          </div>
          <div className={styles.videoWrapper}>
            <iframe
              src="http://192.168.30.71:5090"
              className={styles.videoFrame}
              title="CCTV Camera 1"
            />
          </div>
          <div className={styles.videoFooter}>
            <span className={styles.timestamp}>
              {new Date().toLocaleString('ko-KR')}
            </span>
          </div>
        </div>

        {/* CCTV 2 */}
        <div className={styles.videoCard}>
          <div className={styles.videoHeader}>
            <span className={styles.cameraName}>📹 카메라 2 - 사육장 A</span>
            <span className={styles.status}>● LIVE</span>
          </div>
          <div className={styles.videoWrapper}>
            <div className={styles.placeholder}>
              카메라 준비 중
            </div>
          </div>
          <div className={styles.videoFooter}>
            <span className={styles.timestamp}>
              {new Date().toLocaleString('ko-KR')}
            </span>
          </div>
        </div>

        {/* CCTV 3 */}
        <div className={styles.videoCard}>
          <div className={styles.videoHeader}>
            <span className={styles.cameraName}>📹 카메라 3 - 사육장 B</span>
            <span className={styles.status}>● LIVE</span>
          </div>
          <div className={styles.videoWrapper}>
            <div className={styles.placeholder}>
              카메라 준비 중
            </div>
          </div>
          <div className={styles.videoFooter}>
            <span className={styles.timestamp}>
              {new Date().toLocaleString('ko-KR')}
            </span>
          </div>
        </div>

        {/* CCTV 4 */}
        <div className={styles.videoCard}>
          <div className={styles.videoHeader}>
            <span className={styles.cameraName}>📹 카메라 4 - 출구</span>
            <span className={styles.status}>● LIVE</span>
          </div>
          <div className={styles.videoWrapper}>
            <div className={styles.placeholder}>
              카메라 준비 중
            </div>
          </div>
          <div className={styles.videoFooter}>
            <span className={styles.timestamp}>
              {new Date().toLocaleString('ko-KR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCTV;
