import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ChickenInoculationSchedule.module.css'
import { inoculationAPI } from '../services/api'

const ChickenInoculationSchedule = () => {      
  const navigate = useNavigate()

  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [chickens, setChickens] = useState([])
  const [scheduleData, setScheduleData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 실제 알려진 닭 예방접종 스케줄
  const defaultScheduleData = [
    // 뉴캣슬병 (ND)
    { vaccineType: 'ND', vaccineName: '뉴캣슬병', day: 1, vaccinationMethod: '점안/점비', color: '#3b82f6' },
    { vaccineType: 'ND', vaccineName: '뉴캣슬병', day: 7, vaccinationMethod: '음수 투여', color: '#3b82f6' },
    { vaccineType: 'ND', vaccineName: '뉴캣슬병', day: 10, vaccinationMethod: '음수 투여', color: '#3b82f6' },
    { vaccineType: 'ND', vaccineName: '뉴캣슬병', day: 21, vaccinationMethod: '음수 투여', color: '#3b82f6' },
    { vaccineType: 'ND', vaccineName: '뉴캣슬병', day: 28, vaccinationMethod: '음수 투여', color: '#3b82f6' },
    { vaccineType: 'ND', vaccineName: '뉴캣슬병', day: 60, vaccinationMethod: '근육 주사', color: '#3b82f6' },
    { vaccineType: 'ND', vaccineName: '뉴캣슬병', day: 70, vaccinationMethod: '근육 주사', color: '#3b82f6' },

    // 조류인플루엔자 (HPAI)
    { vaccineType: 'HPAI', vaccineName: '조류인플루엔자', day: 21, vaccinationMethod: '근육 주사', color: '#ef4444' },
    { vaccineType: 'HPAI', vaccineName: '조류인플루엔자', day: 28, vaccinationMethod: '근육 주사', color: '#ef4444' },
    { vaccineType: 'HPAI', vaccineName: '조류인플루엔자', day: 84, vaccinationMethod: '근육 주사', color: '#ef4444' },
    { vaccineType: 'HPAI', vaccineName: '조류인플루엔자', day: 112, vaccinationMethod: '근육 주사', color: '#ef4444' },

    // 감보로병 (IBD)
    { vaccineType: 'IBD', vaccineName: '감보로병', day: 10, vaccinationMethod: '음수 투여', color: '#10b981' },
    { vaccineType: 'IBD', vaccineName: '감보로병', day: 14, vaccinationMethod: '음수 투여', color: '#10b981' },
    { vaccineType: 'IBD', vaccineName: '감보로병', day: 21, vaccinationMethod: '음수 투여', color: '#10b981' },
    { vaccineType: 'IBD', vaccineName: '감보로병', day: 28, vaccinationMethod: '음수 투여', color: '#10b981' },

    // 전염성 기관지염 (IB)
    { vaccineType: 'IB', vaccineName: '전염성 기관지염', day: 1, vaccinationMethod: '분무', color: '#f59e0b' },
    { vaccineType: 'IB', vaccineName: '전염성 기관지염', day: 14, vaccinationMethod: '음수 투여', color: '#f59e0b' },
    { vaccineType: 'IB', vaccineName: '전염성 기관지염', day: 21, vaccinationMethod: '음수 투여', color: '#f59e0b' },
    { vaccineType: 'IB', vaccineName: '전염성 기관지염', day: 35, vaccinationMethod: '음수 투여', color: '#f59e0b' },
    { vaccineType: 'IB', vaccineName: '전염성 기관지염', day: 42, vaccinationMethod: '음수 투여', color: '#f59e0b' },
  ]

  const [selectedVaccine, setSelectedVaccine] = useState('ALL')

  // 컴포넌트 마운트 시 배치 목록 로드
  useEffect(() => {
    loadBatches()
  }, [])

  // 배치 선택 시 스케줄 및 닭 정보 로드
  useEffect(() => {
    if (selectedBatch) {
      loadChickensByBatch(selectedBatch)
      // 스케줄은 항상 defaultScheduleData 사용
      setScheduleData(defaultScheduleData)
    }
  }, [selectedBatch])

  // 배치 목록 로드
  const loadBatches = async () => {
    try {
      setLoading(true)
      const batchesData = await inoculationAPI.getBatchesByFarm(1)
      setBatches(batchesData)
      if (batchesData.length > 0) {
        setSelectedBatch(batchesData[0].batchId)
      }
    } catch (err) {
      console.error('배치 로드 오류:', err)
      loadDummyData()
    } finally {
      setLoading(false)
    }
  }

  // 배치별 닭 정보 로드
  const loadChickensByBatch = async (batchId) => {
    try {
      const chickensData = await inoculationAPI.getChickensByBatch(batchId)
      setChickens(chickensData)
    } catch (err) {
      console.error('닭 목록 로드 오류:', err)
      loadDummyChickens(batchId)
    }
  }

  // 개발용 더미 배치 데이터
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
      }
    ]
    setBatches(dummyBatches)
    setSelectedBatch('2025-001')
  }

  // 개발용 더미 닭 데이터
  const loadDummyChickens = (batchId) => {
    const dummyChickens = [
      { chickenId: 1, batchId: '2025-001', age: 45, nd: true, hpai: true, ibd: true, ib: true },
      { chickenId: 2, batchId: '2025-001', age: 45, nd: true, hpai: true, ibd: true, ib: false },
      { chickenId: 3, batchId: '2025-001', age: 45, nd: true, hpai: false, ibd: true, ib: true },
    ]
    const filteredChickens = dummyChickens.filter(c => c.batchId === batchId)
    setChickens(filteredChickens)
  }

  const selectedBatchInfo = batches.find(b => b.batchId === selectedBatch)

  const vaccineFilters = [
    { value: 'ALL', label: '전체', color: '#6b7280' },
    { value: 'ND', label: 'ND (뉴캣슬병)', color: '#3b82f6' },
    { value: 'HPAI', label: 'HPAI (조류인플루엔자)', color: '#ef4444' },
    { value: 'IBD', label: 'IBD (감보로병)', color: '#10b981' },
    { value: 'IB', label: 'IB (전염성 기관지염)', color: '#f59e0b' },
  ]

  // 안전한 필터링
  const safeScheduleData = Array.isArray(scheduleData) ? scheduleData : []
  const filteredSchedule = selectedVaccine === 'ALL'
    ? safeScheduleData
    : safeScheduleData.filter(item => item.vaccineType === selectedVaccine)

  // 일령별로 그룹화
  const groupedByDay = filteredSchedule.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = []
    }
    acc[item.day].push(item)
    return acc
  }, {})

  const sortedDays = Object.keys(groupedByDay).sort((a, b) => Number(a) - Number(b))

  // 주령으로 변환
  const getWeek = (day) => Math.floor(day / 7)

  // 닭의 접종 상태 확인
  const getVaccineStatus = (vaccineType) => {
    if (chickens.length === 0) return null
    
    const vaccineKey = vaccineType.toLowerCase()
    const completed = chickens.filter(c => c[vaccineKey]).length
    const total = chickens.length
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      allCompleted: completed === total,
      isCompleted: completed > 0
    }
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
      <h2>예방 접종 스케줄</h2>
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
          {batches.map(batch => (
            <option key={batch.batchId} value={batch.batchId}>
              {batch.batchId} (입식일: {new Date(batch.entryDate).toLocaleDateString()})
            </option>
          ))}
        </select>
        {selectedBatchInfo && (
          <div className={styles.batchInfo}>
            📌 입식일: <strong>{new Date(selectedBatchInfo.entryDate).toLocaleDateString()}</strong>
          </div>
        )}
      </div>

      {/* 접종 현황 카드 */}
      <div className={styles.statusCards}>
        {vaccineFilters.slice(1).map(filter => {
          const status = getVaccineStatus(filter.value)
          return status ? (
            <div key={filter.value} className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <span className={styles.statusLabel} style={{ color: filter.color }}>
                  {filter.label}
                </span>
                <span className={`${styles.statusPercent} ${status.allCompleted ? styles.completed : ''}`}>
                  {status.percentage}%
                </span>
              </div>
              <div className={styles.statusBar}>
                <div 
                  className={styles.statusFill} 
                  style={{ 
                    width: `${status.percentage}%`,
                    backgroundColor: filter.color 
                  }}
                ></div>
              </div>
              <span className={styles.statusText}>
                {status.completed} / {status.total} 마리
              </span>
            </div>
          ) : null
        })}
      </div>

      <div className={styles.filterSection}>
        <label className={styles.filterLabel}>질병 필터</label>
        <div className={styles.filterButtons}>
          {vaccineFilters.map(filter => (
            <button
              key={filter.value}
              className={`${styles.filterBtn} ${selectedVaccine === filter.value ? styles.active : ''}`}
              style={{
                borderColor: selectedVaccine === filter.value ? filter.color : '#e5e7eb',
                background: selectedVaccine === filter.value ? `${filter.color}15` : 'white'
              }}
              onClick={() => setSelectedVaccine(filter.value)}
            >
              <span
                className={styles.colorDot}
                style={{ background: filter.color }}
              ></span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.timeline}>
        {sortedDays.map(day => {
          const dayNum = Number(day)
          const currentDate = new Date()
          const entryDate = selectedBatchInfo ? new Date(selectedBatchInfo.entryDate) : new Date()
          const daysSinceEntry = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24))
          
          const isPast = dayNum < daysSinceEntry
          const isCurrent = dayNum === daysSinceEntry
          const isSoon = dayNum > daysSinceEntry && dayNum <= daysSinceEntry + 7

          return (
            <div
              key={day}
              className={`${styles.dayCard} ${isPast ? styles.past : ''} ${isCurrent ? styles.current : ''} ${isSoon ? styles.soon : ''}`}
            >
              <div className={styles.dayHeader}>
                <div className={styles.dayNumber}>
                  {day}일령
                  {isCurrent && <span className={styles.currentBadge}>오늘</span>}
                  {isSoon && <span className={styles.soonBadge}>임박</span>}
                </div>
                <div className={styles.weekNumber}>{getWeek(dayNum)}주차</div>
              </div>
              <div className={styles.vaccineList}>
                {groupedByDay[day].map((item, idx) => {
                  const vaccineStatus = getVaccineStatus(item.vaccineType)
                  const isCompleted = vaccineStatus && vaccineStatus.isCompleted
                  
                  return (
                    <div
                      key={idx}
                      className={`${styles.vaccineItem} ${isCompleted ? styles.vaccineCompleted : ''}`}
                      style={{ borderLeftColor: item.color }}
                    >
                      <div className={styles.vaccineInfo}>
                        <span
                          className={styles.vaccineBadge}
                          style={{ background: `${item.color}20`, color: item.color }}
                        >
                          {item.vaccineType}
                        </span>
                        <span className={styles.vaccineName}>{item.vaccineName}</span>
                      </div>
                      <div className={styles.vaccineMethod}>
                        💉 {item.vaccinationMethod}
                        {isCompleted && vaccineStatus.allCompleted && (
                          <span className={styles.completedBadge}>✓ 완료</span>
                        )}
                        {isCompleted && !vaccineStatus.allCompleted && (
                          <span className={styles.partialBadge}>⚠ 진행중 ({vaccineStatus.completed}/{vaccineStatus.total})</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.legend}>
        <h3 className={styles.legendTitle}>💡 접종 방법 안내</h3>
        <div className={styles.legendGrid}>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon}>💧</span>
            <div>
              <strong>점안/점비</strong>
              <p>눈 또는 코에 직접 백신 투여</p>
            </div>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon}>💦</span>
            <div>
              <strong>음수 투여</strong>
              <p>식수에 백신을 희석하여 제공</p>
            </div>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon}>💉</span>
            <div>
              <strong>근육 주사</strong>
              <p>가슴 근육에 직접 주사</p>
            </div>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIcon}>🌫️</span>
            <div>
              <strong>분무</strong>
              <p>공기 중에 백신을 분무</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChickenInoculationSchedule