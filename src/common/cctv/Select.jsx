import React from 'react'
import styles from './Select.module.css'

const Select = ({size='120px', bgColor='white' , children, ...props}) => {
  return (
    <select 
      className={styles.select}
      style={{width: size, backgroundColor: bgColor}} 
      {...props}
    >
      {children}
    </select>
  )
}

export default Select