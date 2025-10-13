import React, { useEffect, useState } from 'react'
import styles from './ChickenManagement.module.css'
import Input from '../common/Input'
import Button from '../common/Button'
import { batchAPI, farmAPI } from '../services/api'
import ChickenList from './ChickenList'

const ChickenManagement = () => {
  //화면 다시 그리기
  const [reload, setReload] = useState(0)

  //출하를 위한 체크박스
  const [checkedBatches, setCheckedBatches] = useState([]);

  //배치 번호 넘기기
  const [selectedBatchId, setSelectedBatchId] = useState('')
  
  //축사 정보 저장
  const [farmName, setFarmName] = useState('')

  //배치 정보 저장
  const [batch, setBatch] = useState({
    'farmNum' : '',
    'entryDate' : '',
    'initialCount' : ''
  })

  //불러온 배치 정보 담을 변수
  const [batchInfo, setBatchInfo] = useState([]);

  // 체크박스 선택/해제 처리
  const handleCheckbox = (batchId) => {
    if (checkedBatches.includes(batchId)) {
      // 이미 체크된 경우 제거
      setCheckedBatches(checkedBatches.filter(id => id !== batchId));
    } else {
      // 체크 추가
      setCheckedBatches([...checkedBatches, batchId]);
    }
  }

  const handleShipment = async () => {
  if (checkedBatches.length === 0) {
    alert('출하할 배치를 선택해주세요');
    return;
  }

  try {
    await batchAPI.updateShipment(checkedBatches);
    alert('출하 완료');
    setCheckedBatches([]);  // 체크박스 초기화
    setReload(reload + 1);
  } catch (e) {
    console.log(e);
    alert('출하 처리 중 오류가 발생했습니다');
  }
}

  //배치 정보 불러오기
  useEffect(() => {
    const fetchBatchInfo = async () => {
      try {
        const res = await batchAPI.getBatchInfo();
        console.log('배치 정보 응답:', res);
        // API 응답이 {success: true, data: [...]} 형태인지 확인
        if (res && res.success && Array.isArray(res.data)) {
          setBatchInfo(res.data);
        } else if (Array.isArray(res)) {
          setBatchInfo(res);
        } else {
          console.log('배치 정보가 배열이 아닙니다:', res);
          setBatchInfo([]);
        }
      } catch (e) {
        console.log('배치 정보 로드 오류:', e);
        setBatchInfo([]);
      }
    };
    fetchBatchInfo();
  }, [reload])

  //양계장 등록
  const regFarmName = async () => {
    try {
      await farmAPI.createFarm({ farmName: farmName });
      alert('등록 완료');
      setFarmName('');
    } catch (e) {
      console.log(e);
    }
  }

  //배치 & 개체 동시 등록
  const regBatchAndChickens = async () => {
    try {
      await batchAPI.createBatch(batch);
      alert('등록 완료');
      setBatch({
        'farmNum': '',
        'entryDate': '',
        'initialCount': ''
      });
    } catch (e) {
      console.log(e);
    }
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
      <h2>개체 관리</h2>
      <div>
        <h3>양계장 등록</h3>
        <div className={styles.farm_reg}>
          <span>양계장 이름</span>
          <Input 
            value={farmName} 
            onChange={(e) => setFarmName(e.target.value)}
            size='120px'
            height='30px'
          />
          <Button 
            size='80px'
            height='30px'
            color='green'
            title='등록'
            onClick={() => regFarmName()}
          />
        </div>
      </div>
      <div>
        <h3>배치 등록</h3>
        <div className={styles.batch_reg}>
          <div className={styles.input_group}>
            <span>양계장 번호</span>
            <Input 
              size='120px'
              height='30px'
              name='farmNum'
              value={batch.farmNum}
              onChange={(e) => handleBatch(e)}
            />
          </div>
          <div className={styles.input_group}>
            <span>입식일</span>
            <Input 
              size='120px'
              height='30px'
              type='date'
              name='entryDate'
              value={batch.entryDate}
              onChange={(e) => handleBatch(e)}
            />
          </div>
          <div className={styles.input_group}>
            <span>닭의 수</span>
            <Input 
              size='120px'
              height='30px'
              name='initialCount'
              value={batch.initialCount}
              onChange={(e) => handleBatch(e)}
            />
          </div>
          <Button 
            size='80px'
            height='30px'
            color='green'
            title='등록' 
            onClick={() => regBatchAndChickens()}
          />
        </div>
      </div>
      <div>
        <h3>배치 목록</h3>
        <div className={styles.batch_list}>
          <table className={styles.table}>
            <thead>
              <tr>
                <td>양계장 번호</td>
                <td>배치 번호</td>
                <td>입식일</td>
                <td>초기 닭의 수</td>
                <td>현재 닭의 수</td>
                <td>출하</td>
              </tr>
            </thead>
            <tbody>
              {
                Array.isArray(batchInfo) && batchInfo.length > 0 
                  ? batchInfo.map((batch, i) => (
                      <tr key={i} onClick={() => setSelectedBatchId(batch.batchId)}>
                        <td>{batch.farmNum}</td>
                        <td>{batch.batchId}</td>
                        <td>{batch.entryDate}</td>
                        <td>{batch.initialCount}</td>
                        <td>{batch.currentCount}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <input 
                            type='checkbox'
                            value={batch.batchId}
                            checked={checkedBatches.includes(batch.batchId)}
                            onChange={() => handleCheckbox(batch.batchId)}
                          />
                        </td>
                      </tr>
                    ))
                  : (
                      <tr>
                        <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                          배치 데이터가 없습니다.
                        </td>
                      </tr>
                    )
              }
            </tbody>
          </table>
          <Button 
            size='80px'
            height='30px'
            color='green'
            title='출하' 
            onClick={handleShipment}
          />
        </div>
      </div>
      {
        selectedBatchId && <ChickenList batchId={selectedBatchId}/>
      }
    </div>
  )
}

export default ChickenManagement