import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ChickenInoculationList.module.css'
import { inoculationAPI, batchAPI } from '../services/api'

const ChickenInoculationList = () => {
  const navigate = useNavigate()

  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [chickens, setChickens] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const vaccineColumns = [
    { key: 'nd', label: 'ND', fullName: '뉴캣슬병' },
    { key: 'hpai', label: 'HPAI', fullName: '조류인플루엔자' },
    { key: 'ibd', label: 'IBD', fullName: '감보로병' },
    { key: 'ib', label: 'IB', fullName: '전염성 기관지염' },
  ]

  // 컴포넌트 마운트 시 배치 목록 로드
  useEffect(() => {
    // 실제 백엔드 연결 시도
    loadBatches()
    // 개발용 더미 데이터는 백엔드 연결 실패 시 자동으로 로드됨
  }, [])

  // 배치 선택 시 닭 목록 로드
  useEffect(() => {
    if (selectedBatch) {
      // 실제 백엔드 연결 시도
      loadChickensByBatch(selectedBatch)
      // 개발용 더미 데이터는 백엔드 연결 실패 시 자동으로 로드됨
    }
  }, [selectedBatch])

  // 배치 목록 로드
  const loadBatches = async () => {
    try {
      setLoading(true)
      const batchesData = await batchAPI.getBatchInfo() // 임시로 농장 번호 1 사용
      setBatches(batchesData)
      if (batchesData.length > 0) {
        setSelectedBatch(batchesData[0].batchId)
      }
    } catch (err) {
      console.error('배치 로드 오류:', err)
      console.log('백엔드 연결 실패, 더미 데이터를 사용합니다.')
      // 모든 오류에 대해 더미 데이터 사용
      loadDummyData()
    } finally {
      setLoading(false)
    }
  }

  // 배치별 닭 목록 로드
  const loadChickensByBatch = async (batchId) => {
    try {
      setLoading(true)
      const chickensData = await inoculationAPI.getChickensByBatch(batchId)
      setChickens(chickensData)
    } catch (err) {
      console.error('닭 목록 로드 오류:', err)
      console.log('백엔드 연결 실패, 더미 데이터를 사용합니다.')
      // 모든 오류에 대해 더미 데이터 사용
      loadDummyChickensByBatch(batchId)
    } finally {
      setLoading(false)
    }
  }

  // 개발용 더미 데이터 로드
  const loadDummyData = () => {
    const dummyBatches = [
      {
        batchId: '2025-001',
        entryDate: '2024-12-01T00:00:00',
        initialCount: 100,
        currentCount: 98,
        shipmentStatus: false,
        farmNum: 1
      },
      {
        batchId: '2025-002',
        entryDate: '2024-12-15T00:00:00',
        initialCount: 80,
        currentCount: 80,
        shipmentStatus: false,
        farmNum: 1
      },
      {
        batchId: '2025-003',
        entryDate: '2025-01-01T00:00:00',
        initialCount: 120,
        currentCount: 120,
        shipmentStatus: false,
        farmNum: 2
      }
    ]
    
    setBatches(dummyBatches)
    setSelectedBatch('2025-001')
  }

  // 더미 데이터에서 배치별 닭 목록 로드
  const loadDummyChickensByBatch = (batchId) => {
    const dummyChickens = [
      { chickenId: 1, batchId: '2025-001', age: 45, rawWeight: 1.8, growthStage: 'FINISHER', healthStatus: 'HEALTHY', nd: true, hpai: true, ibd: true, ib: true },
      { chickenId: 2, batchId: '2025-001', age: 45, rawWeight: 1.9, growthStage: 'FINISHER', healthStatus: 'HEALTHY', nd: true, hpai: true, ibd: true, ib: false },
      { chickenId: 3, batchId: '2025-001', age: 45, rawWeight: 1.7, growthStage: 'FINISHER', healthStatus: 'HEALTHY', nd: true, hpai: true, ibd: true, ib: true },
      { chickenId: 4, batchId: '2025-002', age: 30, rawWeight: 1.4, growthStage: 'GROWER', healthStatus: 'HEALTHY', nd: true, hpai: true, ibd: true, ib: false },
      { chickenId: 5, batchId: '2025-002', age: 30, rawWeight: 1.5, growthStage: 'GROWER', healthStatus: 'HEALTHY', nd: true, hpai: false, ibd: true, ib: false },
      { chickenId: 6, batchId: '2025-003', age: 15, rawWeight: 1.0, growthStage: 'CHICK', healthStatus: 'HEALTHY', nd: true, hpai: false, ibd: true, ib: false },
      { chickenId: 7, batchId: '2025-003', age: 15, rawWeight: 1.1, growthStage: 'CHICK', healthStatus: 'HEALTHY', nd: true, hpai: false, ibd: false, ib: false },
      { chickenId: 8, batchId: '2025-003', age: 15, rawWeight: 0.9, growthStage: 'CHICK', healthStatus: 'HEALTHY', nd: false, hpai: false, ibd: true, ib: false }
    ]
    
    const filteredChickens = dummyChickens.filter(chicken => chicken.batchId === batchId)
    setChickens(filteredChickens)
  }

  const getCompletionRate = (vaccineKey) => {
    const total = chickens.length
    const completed = chickens.filter(c => c[vaccineKey]).length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2>예방 접종 리스트</h2>
      <div className={styles.header}>
        <button className={styles.btnBack} onClick={() => navigate('/home/inoculation')}>
          ← 접종 관리로 돌아가기
        </button>
      </div>

      <div className={styles.batchSelector}>
        <label className={styles.batchLabel}>배치 선택</label>
        <select
          className={styles.batchSelect}
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
        >
          {batches.filter(batch => batch.currentCount > 0).map(batch => (
            <option key={batch.batchId} value={batch.batchId}>
              {batch.batchId} (입식일: {new Date(batch.entryDate).toLocaleDateString()}, {batch.currentCount}마리)
            </option>
          ))}
        </select>
      </div>

      <div className={styles.summaryCards}>
        {vaccineColumns.map(vaccine => {
          const rate = getCompletionRate(vaccine.key)
          return (
            <div key={vaccine.key} className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryLabel}>{vaccine.label}</span>
                <span className={styles.summaryRate}>{rate}%</span>
              </div>
              <div className={styles.summaryTitle}>{vaccine.fullName}</div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${rate}%` }}></div>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>개체 번호</th>
              <th>일령</th>
              <th>체중 (kg)</th>
              {vaccineColumns.map(vaccine => (
                <th key={vaccine.key} className={styles.vaccineHeader}>
                  <div className={styles.vaccineHeaderContent}>
                    <span className={styles.vaccineShort}>{vaccine.label}</span>
                    <span className={styles.vaccineFull}>{vaccine.fullName}</span>
                  </div>
                </th>
              ))}
              <th>접종률</th>
            </tr>
          </thead>
          <tbody>
            {chickens.map(chicken => {
              const totalVaccines = vaccineColumns.length
              const completedVaccines = vaccineColumns.filter(v => chicken[v.key]).length
              const completionRate = totalVaccines > 0 ? Math.round((completedVaccines / totalVaccines) * 100) : 0

              return (
                <tr key={chicken.chickenId}>
                  <td className={styles.tag}>C-{chicken.chickenId.toString().padStart(3, '0')}</td>
                  <td>{chicken.age}일</td>
                  <td>{chicken.rawWeight}</td>
                  {vaccineColumns.map(vaccine => (
                    <td key={vaccine.key} className={styles.vaccineCell}>
                      {chicken[vaccine.key] ? (
                        <span className={styles.badgeComplete}>✓</span>
                      ) : (
                        <span className={styles.badgePending}>✗</span>
                      )}
                    </td>
                  ))}
                  <td>
                    <span className={`${styles.rateText} ${completionRate === 100 ? styles.rateComplete : ''}`}>
                      {completionRate}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ChickenInoculationList
