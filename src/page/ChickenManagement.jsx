import React, { useState } from 'react'
import styles from './ChickenManagement.module.css'
import Input from '../common/Input'
import Button from '../common/Button'
import axios from 'axios'

const ChickenManagement = () => {
  //축사 정보 저장
  const [farmName, setFarmName] = useState('')

  //배치 정보 저장
  const [batch, setBatch] = useState({
    'farmNum' : '',
    'entryDate' : '',
    'initialCount' : ''
  })

  //축사 등록
  const regFarmName = () => {
    axios.post(`/api/farm`, {farmName : farmName})
    .then(res => alert('등록 완료'))
    .catch(e => {
      console.log(e)
    });
  }

  //배치 등록

  return (
    <div className={styles.container}>
      <h2>닭 관리</h2>
      <div>
        <h3>양계장 등록</h3>
        <div>
          <span>양계장 이름</span>
          <Input value={farmName} onChange={(e) => {setFarmName(e.target.value)}}/>
          <Button title='등록' onClick={() => {regFarmName()}}/>
        </div>
      </div>
      <div>
        <h3>배치 등록</h3>
        <div>
          <span>축사 번호</span>
          <Input />
          <span>입식일</span>
          <Input />
          <span>닭의 수</span>
          <Input />
          <Button title='등록'/>
        </div>
      </div>
      <div>
        <h3>배치 표</h3>
        <div>
          <table className={styles.table}>
            <thead>
              <tr>
                <td>축사 번호</td>
                <td>배치 번호</td>
                <td>입식일</td>
                <td>초기 닭의 수</td>
                <td>현재 닭의 수</td>
                <td>출하 여부</td>
              </tr>
            </thead>
          </table>
        </div>
      </div>
      <div>
        <h3>수정</h3>
      </div>
    </div>
  )
}

export default ChickenManagement