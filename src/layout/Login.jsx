import React, { useState } from 'react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import styles from './Login.module.css'
import axios from 'axios'

const Login = () => {

  // const testData = useState({
  //   'memId' : 'admin123',
  //   'memPw' : '123456'
  // })

  const [logindate, setLoginDate] = useState({
    'memId' : '',
    'memPw' : ''
  })


  // const login = () => {
  //   console.log(testData);
  //   setLoginDate({
  //     ...testData
  //   });
  //   console.log(logindate);
  // }

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
          {
            logindate.memId && (
              <Button
                className={styles.input_inButton}
                size='10px'
                title='x'
                onClick={() => {
                  setLoginDate({
                    ...logindate,
                    'memId' : ''
                  })
                }}
              />
            )
          }
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
          {
            logindate.memPw && (
              <Button
                className={styles.input_inButton}
                size='10px'
                title='x'
                onClick={() => {
                  setLoginDate({
                    ...logindate,
                    'memPw' : ''
                  })
                }}
              />
            )
          }
        </div>
        <div className={styles.button_div}>
          <Button 
            title='로그인'
            className={styles.button}
            size='500px'
            height='45px'
            // onClick={login}
          />
        </div>
      </div>
    </div>
  )
}

export default Login