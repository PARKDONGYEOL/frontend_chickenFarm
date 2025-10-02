import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ChickenInoculationList.module.css'

const ChickenInoculationList = () => {
  const navigate = useNavigate()

  const [batches] = useState([
    { id: 1, name: '2024-01차', startDate: '2024-01-15', chickenCount: 3 },
    { id: 2, name: '2024-02차', startDate: '2024-02-01', chickenCount: 3 },
    { id: 3, name: '2024-03차', startDate: '2024-02-15', chickenCount: 2 },
  ])

  const [selectedBatch, setSelectedBatch] = useState(1)

  const [allChickens] = useState([
    { id: 1, batchId: 1, tag: 'C-001', age: 15, weight: 1.2, ND: true, HPAI: false, IBD: true, IB: false },
    { id: 2, batchId: 1, tag: 'C-002', age: 15, weight: 1.3, ND: false, HPAI: false, IBD: true, IB: false },
    { id: 3, batchId: 1, tag: 'C-003', age: 15, weight: 1.1, ND: true, HPAI: true, IBD: true, IB: false },
    { id: 4, batchId: 2, tag: 'C-004', age: 30, weight: 1.5, ND: true, HPAI: false, IBD: false, IB: false },
    { id: 5, batchId: 2, tag: 'C-005', age: 30, weight: 1.4, ND: true, HPAI: true, IBD: true, IB: true },
    { id: 6, batchId: 2, tag: 'C-006', age: 30, weight: 1.6, ND: false, HPAI: false, IBD: false, IB: false },
    { id: 7, batchId: 3, tag: 'C-007', age: 45, weight: 1.5, ND: true, HPAI: false, IBD: true, IB: false },
    { id: 8, batchId: 3, tag: 'C-008', age: 45, weight: 1.8, ND: true, HPAI: true, IBD: true, IB: true },
  ])

  const chickens = allChickens.filter(c => c.batchId === selectedBatch)

  const vaccineColumns = [
    { key: 'ND', label: 'ND', fullName: '뉴캣슬병' },
    { key: 'HPAI', label: 'HPAI', fullName: '조류인플루엔자' },
    { key: 'IBD', label: 'IBD', fullName: '감보로병' },
    { key: 'IB', label: 'IB', fullName: '전염성 기관지염' },
  ]

  const getCompletionRate = (vaccineKey) => {
    const total = chickens.length
    const completed = chickens.filter(c => c[vaccineKey]).length
    return Math.round((completed / total) * 100)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>📋 예방 접종 전체 리스트</h1>
          <p className={styles.subtitle}>모든 개체의 질병별 접종 현황을 한눈에 확인</p>
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
              {batch.name} (시작일: {batch.startDate}, {batch.chickenCount}마리)
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
              const completionRate = Math.round((completedVaccines / totalVaccines) * 100)

              return (
                <tr key={chicken.id}>
                  <td className={styles.tag}>{chicken.tag}</td>
                  <td>{chicken.age}일</td>
                  <td>{chicken.weight}</td>
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
