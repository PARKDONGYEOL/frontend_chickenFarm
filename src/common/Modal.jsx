import React from 'react'
import styles from './Modal.module.css'

const Modal = ({
  size='500px', 
  title='', 
  isOpen=false, 
  onClose,
  children}) => {
  //isOpen이 false면 모달을 닫는다.
  if(!isOpen) return null;

  return (
    <div className={styles.modal_overlay}>
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