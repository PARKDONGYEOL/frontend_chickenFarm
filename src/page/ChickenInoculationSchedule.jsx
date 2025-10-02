import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ChickenInoculationSchedule.module.css'

const ChickenInoculationSchedule = () => {
  const navigate = useNavigate()

  const [batches] = useState([
    { id: 1, name: '2024-01차', startDate: '2024-01-15', currentDay: 15 },
    { id: 2, name: '2024-02차', startDate: '2024-02-01', currentDay: 30 },
    { id: 3, name: '2024-03차', startDate: '2024-02-15', currentDay: 45 },
  ])

  const [selectedBatch, setSelectedBatch] = useState(1)
  const selectedBatchInfo = batches.find(b => b.id === selectedBatch)

  const scheduleData = [
    // 뉴캣슬병 (ND)
    { vaccine: 'ND', name: '뉴캣슬병', day: 1, method: '점안/점비', color: '#3b82f6' },
    { vaccine: 'ND', name: '뉴캣슬병', day: 7, method: '음수 투여', color: '#3b82f6' },
    { vaccine: 'ND', name: '뉴캣슬병', day: 10, method: '음수 투여', color: '#3b82f6' },
    { vaccine: 'ND', name: '뉴캣슬병', day: 21, method: '음수 투여', color: '#3b82f6' },
    { vaccine: 'ND', name: '뉴캣슬병', day: 28, method: '음수 투여', color: '#3b82f6' },
    { vaccine: 'ND', name: '뉴캣슬병', day: 60, method: '근육 주사', color: '#3b82f6' },
    { vaccine: 'ND', name: '뉴캣슬병', day: 70, method: '근육 주사', color: '#3b82f6' },

    // 조류인플루엔자 (HPAI)
    { vaccine: 'HPAI', name: '조류인플루엔자', day: 21, method: '근육 주사', color: '#ef4444' },
    { vaccine: 'HPAI', name: '조류인플루엔자', day: 28, method: '근육 주사', color: '#ef4444' },
    { vaccine: 'HPAI', name: '조류인플루엔자', day: 84, method: '근육 주사', color: '#ef4444' },
    { vaccine: 'HPAI', name: '조류인플루엔자', day: 112, method: '근육 주사', color: '#ef4444' },

    // 감보로병 (IBD)
    { vaccine: 'IBD', name: '감보로병', day: 10, method: '음수 투여', color: '#10b981' },
    { vaccine: 'IBD', name: '감보로병', day: 14, method: '음수 투여', color: '#10b981' },
    { vaccine: 'IBD', name: '감보로병', day: 21, method: '음수 투여', color: '#10b981' },
    { vaccine: 'IBD', name: '감보로병', day: 28, method: '음수 투여', color: '#10b981' },

    // 전염성 기관지염 (IB)
    { vaccine: 'IB', name: '전염성 기관지염', day: 1, method: '분무', color: '#f59e0b' },
    { vaccine: 'IB', name: '전염성 기관지염', day: 14, method: '음수 투여', color: '#f59e0b' },
    { vaccine: 'IB', name: '전염성 기관지염', day: 21, method: '음수 투여', color: '#f59e0b' },
    { vaccine: 'IB', name: '전염성 기관지염', day: 35, method: '음수 투여', color: '#f59e0b' },
    { vaccine: 'IB', name: '전염성 기관지염', day: 42, method: '음수 투여', color: '#f59e0b' },
  ]

  const [selectedVaccine, setSelectedVaccine] = useState('ALL')

  const vaccineFilters = [
    { value: 'ALL', label: '전체', color: '#6b7280' },
    { value: 'ND', label: 'ND (뉴캣슬병)', color: '#3b82f6' },
    { value: 'HPAI', label: 'HPAI (조류인플루엔자)', color: '#ef4444' },
    { value: 'IBD', label: 'IBD (감보로병)', color: '#10b981' },
    { value: 'IB', label: 'IB (전염성 기관지염)', color: '#f59e0b' },
  ]

  const filteredSchedule = selectedVaccine === 'ALL'
    ? scheduleData
    : scheduleData.filter(item => item.vaccine === selectedVaccine)

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>📅 예방 접종 스케줄</h1>
          <p className={styles.subtitle}>일령별 권장 예방 접종 일정</p>
        </div>
        <button className={styles.btnBack} onClick={() => navigate('/home/inoculation')}>
          ← 접종 관리로 돌아가기
        </button>
      </div>

      <div className={styles.batchSelector}>
        <label className={styles.batchLabel}>배치 선택</label>
        <select
          className={styles.batchSelect}
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(Number(e.target.value))}
        >
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>
              {batch.name} (현재 {batch.currentDay}일령)
            </option>
          ))}
        </select>
        <div className={styles.batchInfo}>
          📌 현재 일령: <strong>{selectedBatchInfo.currentDay}일</strong> (시작일: {selectedBatchInfo.startDate})
        </div>
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
          const isPast = dayNum < selectedBatchInfo.currentDay
          const isCurrent = dayNum === selectedBatchInfo.currentDay
          const isSoon = dayNum > selectedBatchInfo.currentDay && dayNum <= selectedBatchInfo.currentDay + 7

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
                <div className={styles.weekNumber}>{getWeek(day)}주차</div>
              </div>
              <div className={styles.vaccineList}>
                {groupedByDay[day].map((item, idx) => (
                  <div
                    key={idx}
                    className={styles.vaccineItem}
                    style={{ borderLeftColor: item.color }}
                  >
                    <div className={styles.vaccineInfo}>
                      <span
                        className={styles.vaccineBadge}
                        style={{ background: `${item.color}20`, color: item.color }}
                      >
                        {item.vaccine}
                      </span>
                      <span className={styles.vaccineName}>{item.name}</span>
                    </div>
                    <div className={styles.vaccineMethod}>
                      💉 {item.method}
                    </div>
                  </div>
                ))}
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
