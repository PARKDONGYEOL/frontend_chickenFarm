import React, { useEffect, useState } from 'react'
import styles from './ChickenList.module.css'
import { chickenAPI } from '../services/api'

const ChickenList = ({batchId}) => {
  //닭 개체 정보 
  const [chickenInfo, setChickenInfo] = useState([]);

  //닭 개체 정보 조회
  useEffect(() => {
    if(batchId){
      const fetchChickens = async () => {
        try {
          const res = await chickenAPI.getChickensByBatch(batchId);
          console.log(res);
          setChickenInfo(res);
        } catch (e) {
          console.log(e);
        }
      };
      fetchChickens();
    }
  }, [batchId])


  if (!batchId || chickenInfo.length === 0) {
   return (
    <table className={styles.table}>
      <thead>
        <tr>
          <td>선택</td>
          <td>개체번호</td>
          <td>나이(일)</td>
          <td>성장단계</td>
          <td>몸무게</td>
          <td>건강상태</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={6} style={{backgroundColor : 'white'}}>조회된 개체 정보가 없습니다.</td>
        </tr>
      </tbody>
     </table>
   )
  }

  return (
      <div className={styles.container}>
        <div className={styles.chicken_count}>
          <div>
            <div>{chickenInfo[0].batchDTO.initialCount}</div>
            <span>총 개체 수</span>
          </div>
          <div>
            <div>{chickenInfo[0].batchDTO.currentCount}</div>
            <span>현 개체 수</span>
          </div>
          <div>
            <div>{(chickenInfo[0].batchDTO.initialCount)-(chickenInfo[0].batchDTO.currentCount)}</div>
            <span>폐사 개체 수</span>
          </div>
          <div>
            <div>{chickenInfo[0].age}</div>
            <span>나이</span>
          </div>
        </div>
        <h3>배치 {batchId} 개체 목록</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <td>선택</td>
              <td>개체번호</td>
              <td>나이(일)</td>
              <td>성장단계</td>
              <td>몸무게</td>
              <td>건강상태</td>
            </tr>
          </thead>
          <tbody>
            {
              chickenInfo.map((e, i) => {
                return (
                  <tr key={i}>
                    <td><input type='checkbox'></input></td>
                    <td>{e.chickenId}</td>
                    <td>{e.age}</td>
                    <td>{e.growthStage}</td>
                    <td>{e.rawWeight}</td>
                    <td>{e.healthStatus}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
  )
}

export default ChickenList