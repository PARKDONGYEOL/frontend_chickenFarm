import React, { useEffect, useState } from 'react';
import styles from './Title.module.css';

const Title = () => {

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.title_div}>
      <p className={visible ? styles.show : ""} >
        유해 동물 자동 감지 CCTV
      </p>
      </div>
  )
}

export default Title