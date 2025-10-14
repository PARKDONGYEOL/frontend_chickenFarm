import React from 'react';
import styles from './Button.module.css';

const Button = ({
  title = '버튼',
  size = '80px',
  color = 'blue',
  fontSize = '0.8rem',
  height = '35px',   // ✅ 높이 기본값
  onClick,
  ...props
}) => {
  return (
    <button
      type="button"
      className={`
        ${styles.btn}
        ${styles[color]}
        ${props.disabled ? styles.disabled : ''}
      `}
      style={{
        width: size,
        height: height,     // ✅ 여기에서 직접 적용
        fontSize: fontSize, // ✅ 글자 크기도 props 반영
      }}
      onClick={onClick}
      {...props}
    >
      {title}
    </button>
  );
};

export default Button;
