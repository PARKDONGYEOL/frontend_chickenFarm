import React from 'react'
import styles from './Input.module.css'

const Input = ({size='120px', height='20px', ...props}) => {
  return (
    <input 
      style={{width : size, height : height}}
      className={styles.input}
      {...props}
    />
  )
}

export default Input