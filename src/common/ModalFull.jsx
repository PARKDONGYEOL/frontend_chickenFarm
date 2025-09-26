import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./ModalFull.module.css";

/**
 * ModalFull
 * - 풀스크린(부모 영향 없음)
 * - 우측 상단 '핫존' 호버 시 제목/닫기 표시
 * - ESC 닫기 지원
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - title?: string
 *  - children: ReactNode
 *  - dimmed?: boolean           // 배경 디밍, default true
 *  - closeOnEsc?: boolean       // ESC 닫기, default true
 *  - hotzoneDebug?: boolean     // 핫존 시각 확인용 (연한 색)
 */
const ModalFull = ({
  isOpen = false,
  onClose,
  title = "",
  children,
  dimmed = true,
  closeOnEsc = true,
  hotzoneDebug = false,
}) => {
  const [showHeader, setShowHeader] = useState(false);
  const hideTimerRef = useRef(null);

  // ESC로 닫기
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeOnEsc, onClose]);

  // 바디 스크롤 잠금
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  const showHeaderNow = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowHeader(true);
  }, []);

  const scheduleHideHeader = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowHeader(false), 900);
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <div className={`${styles.overlay} ${dimmed ? styles.dimmed : ""}`}>

      {/* 컨텐츠(iframe 포함) - 맨 아래 */}
      <div className={styles.panel}>
        {children}
      </div>

      {/* 우측 상단 핫존: 반드시 패널 '위' 레이어에, fixed + 초고 z-index */}
      <div
        className={`${styles.hotzoneTR} ${hotzoneDebug ? styles.hotzoneDebug : ""}`}
        onMouseEnter={showHeaderNow}
        onMouseLeave={scheduleHideHeader}
      />

      {/* 우측 상단 컨트롤(제목/닫기) */}
      <div
        className={`${styles.controls} ${showHeader ? styles.controlsShow : ""}`}
        onMouseEnter={showHeaderNow}
        onMouseLeave={scheduleHideHeader}
      >
        <div className={styles.controlsInner}>
          <div className={styles.title}>{title}</div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">×</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalFull;
