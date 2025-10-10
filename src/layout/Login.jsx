import React, { useState } from 'react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import styles from './Login.module.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const nav = useNavigate();

  const [loginDate, setLoginDate] = useState({
    'memId' : '',
    'memPw' : ''
  });

  const handleLoginData = (e) => {
    setLoginDate({
      ...loginDate,
      [e.target.name] : e.target.value
    });
  }

  const login = () => {
    axios.get('/api/member', { params: loginDate })
      .then(res => {
        if (res.data) { 

        const loginInfo = {
          'memId': res.data.memId,
          'name': res.data.name,
          'role': res.data.role
        };

        sessionStorage.setItem('loginInfo', JSON.stringify(loginInfo));

          if (res.data.role === 'ADMIN') {
            alert('환영합니다.');
            nav('/home');
            setLoginDate({ 'memId': '', 'memPw': '' });
          }

          // 일반 유저는 아무 동작 없음

        } else { 
          alert('ID 혹은 비밀번호가 잘못 입력되었습니다.');
        }

    })
    .catch(e => console.log(e));
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
            value={loginDate.memId}
            onChange={e => handleLoginData(e)}
            className={styles.input}
            onKeyDown={e => {
              if(e.key === 'Enter') login()
            }}
          />
          {
            loginDate.memId && (
              <Button
                className={styles.input_inButton}
                size='10px'
                title='x'
                onClick={() => {
                  setLoginDate({
                    ...loginDate,
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
            value={loginDate.memPw}
            onChange={e => handleLoginData(e)}
            className={styles.input}
            type='password'
            onKeyDown={e => {
              if(e.key === 'Enter') login()
            }}
          />
          {
            loginDate.memPw && (
              <Button
                className={styles.input_inButton}
                size='10px'
                title='x'
                onClick={() => {
                  setLoginDate({
                    ...loginDate,
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
            onClick={() => {
              login()
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Login