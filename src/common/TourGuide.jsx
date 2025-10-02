import React, { useState, useEffect } from "react";
import styles from "./TourGuide.module.css";

const TourGuide = ({ isOpen, onClose, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen || !steps || steps.length === 0) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className={styles.overlay}>
      {/* 하이라이트 영역 (타겟 요소 강조) */}
      {step.targetElement && (
        <div
          className={styles.spotlight}
          style={{
            top: step.targetElement.top,
            left: step.targetElement.left,
            width: step.targetElement.width,
            height: step.targetElement.height,
          }}
        />
      )}

      {/* 설명 박스 (화살표 시작점) */}
      {step.tooltipPosition && (
        <div
          className={styles.descriptionBox}
          style={{
            top: step.tooltipPosition.top,
            left: step.tooltipPosition.left,
          }}
        >
          <h3 className={styles.title}>{step.title}</h3>
          <p className={styles.description}>{step.description}</p>
        </div>
      )}

      {/* 화살표 (SVG) */}
      {step.targetElement && step.tooltipPosition && (
        <svg className={styles.arrowSvg}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#4caf50" />
            </marker>
          </defs>
          <line
            x1={step.arrowStart.x}
            y1={step.arrowStart.y}
            x2={step.arrowEnd.x}
            y2={step.arrowEnd.y}
            stroke="#4caf50"
            strokeWidth="3"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      )}

      {/* 오른쪽 네비게이션 버튼 */}
      {!isLastStep && (
        <button className={styles.nextArrowBtn} onClick={handleNext}>
          &#8250;
        </button>
      )}

      {/* 왼쪽 이전 버튼 (첫 단계 아닐 때만) */}
      {currentStep > 0 && (
        <button className={styles.prevArrowBtn} onClick={handlePrev}>
          &#8249;
        </button>
      )}

      {/* 마지막 단계 완료 버튼 */}
      {isLastStep && (
        <div className={styles.completeButtonWrapper}>
          <button className={styles.completeBtn} onClick={onClose}>
            완료
          </button>
        </div>
      )}
    </div>
  );
};

export default TourGuide;
