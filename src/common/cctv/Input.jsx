import React from 'react'
import styles from './Input.module.css'

const Input = ({size='120px', bgColor='white', ...props}) => {
  return (
    <input 
      style={{width: size, backgroundColor: bgColor}} 
      className={styles.input} 
      {...props} 
    />
  )
}

export default Input