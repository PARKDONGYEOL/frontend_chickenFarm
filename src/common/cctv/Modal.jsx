import React from 'react'
import styles from './Modal.module.css'

// Modal 컴포넌트
//props
// 1. size => 모달의 크기 지정
// 2. title => 모달의 제목 지정
// 3. children => 모달의 내용부
const Modal = ({
  size='500px', 
  title='', 
  height=null,   
  isOpen=false, 
  onClose,
  children}) => {
  //isOpen이 false면 모달을 닫는다.
  if(!isOpen) return null;

  const handleCctvClick = (e) => {
    e.preventDefault();
    setCctvModalOpen(true); // ✅ 모달 열기
  };

  return (
    <div className={styles.modal_overlay}  style={{height:height}} >
      <div 
        className={styles.modal_content}
        style={{width:size}}
      >
        <div className={styles.modal_title}>
          <button 
            type='button' 
            className={styles.close_btn}
            onClick={onClose}
          >x</button>
          <p>{title}</p>
        </div>
        <div className={styles.content_div}>
          {children}
        </div>
      </div>


      


    </div>
  );
};

export default Modal