import React from "react";
import styles from "./ModalFloat.module.css";

/**
 * 배경을 가리지 않는 부동 패널 모달
 * - 배경 클릭 가능(차단하지 않음)
 * - 패널 내부만 클릭 처리
 * - X 버튼으로만 닫힘
 */
const ModalFloat = ({
  isOpen = false,
  onClose,
  title = "",
  width = 900,
  height = 420,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div
        className={styles.panel}
        style={{ width, height }}
        role="dialog"
        aria-modal="false"
        aria-label={title || "패널"}
      >
        <div className={styles.toolbar}>
          <div className={styles.title}>{title}</div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          > 
            ×
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default ModalFloat