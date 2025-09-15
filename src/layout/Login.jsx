import React, { useState } from 'react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import styles from './Login.module.css'

const Login = () => {

  const [logindate, setLoginDate] = useState({
    'memId' : '',
    'memPw' : ''
  })

  const handleLoginData = (e) => {
    setLoginDate({
      ...logindate,
      [e.target.name] : e.target.value
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>Smart Farm</div>
      <div className={styles.form_div}>
        <div className={styles.input_div}>
          <Input
            size='500px'
            height='45px'
            placeholder='아이디 또는 전화번호'
            name='memId'
            value={logindate.memId}
            onChange={e => handleLoginData(e)}
            className={styles.input}
          />
        </div>
        <div className={styles.input_div}>
          <Input
            size='500px'
            height='45px'
            placeholder='비밀번호'
            name='memPw'
            value={logindate.memPw}
            onChange={e => handleLoginData(e)}
            className={styles.input}
            type='password'
          />
        </div>
        <div className={styles.button_div}>
          <Button 
            title='로그인'
            className={styles.button}
            size='500px'
            height='45px'
          />
        </div>
      </div>
    </div>
  )
}

export default Login