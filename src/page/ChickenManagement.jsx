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

  //양계장 등록
  const regFarmName = () => {
    axios.post(`/api/farm`, {farmName : farmName})
    .then(res => {
      alert('등록 완료');
      setFarmName('');
    })
    .catch(e => {
      console.log(e)
    });
  }

  //배치 & 개체 동시 등록
  const regBatchAndChickens = () => {
    axios.post('/api/batch', batch)
    .then(res => {
      alert('등록 완료');
      setBatch({
        'farmNum' : '',
        'entryDate' : '',
        'initialCount' : ''
      })
    })
    .catch(e => {
      console.log(e)
    });
  }

  //배치 인풋에 입력한 값으로 변경
  const handleBatch = (e) => {
    setBatch({
      ...batch,
      [e.target.name] : e.target.value
    })
  }

  return (
    <div className={styles.container}>
      <h2>닭 관리</h2>
      <div>
        <h3>양계장 등록</h3>
        <div>
          <span>양계장 이름</span>
          <Input value={farmName} onChange={(e) => {setFarmName(e.target.value)}}/>
          <Button title='등록' onClick={() => regFarmName()}/>
        </div>
      </div>
      <div>
        <h3>배치 등록</h3>
        <div>
          <span>양계장 번호</span>
          <Input 
            name='farmNum'
            value={batch.farmNum}
            onChange={(e) => handleBatch(e)}
          />
          <span>입식일</span>
          <Input 
            type='date'
            name='entryDate'
            value={batch.entryDate}
            onChange={(e) => handleBatch(e)}
          />
          <span>닭의 수</span>
          <Input 
            name='initialCount'
            value={batch.initialCount}
            onChange={(e) => handleBatch(e)}
          />
          <Button title='등록' onClick={() => regBatchAndChickens()}/>
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