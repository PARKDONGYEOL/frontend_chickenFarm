import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './ChickenInoculation.module.css'

const ChickenInoculation = () => {
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

  const [chickens, setChickens] = useState(allChickens)

  const [selectedVaccine, setSelectedVaccine] = useState('ND')
  const [selectedIds, setSelectedIds] = useState([])

  // 배치 변경 시 필터링된 닭 목록 업데이트
  const filteredChickens = chickens.filter(c => c.batchId === selectedBatch)

  const vaccineOptions = [
    { value: 'ND', label: '뉴캣슬병 (ND)', schedule: '1일령, 7-10일령, 21-28일령, 60-70일령' },
    { value: 'HPAI', label: '조류인플루엔자 (HPAI)', schedule: '3-4주령, 12-16주령' },
    { value: 'IBD', label: '감보로병 (IBD)', schedule: '10-14일령, 21-28일령' },
    { value: 'IB', label: '전염성 기관지염 (IB)', schedule: '1일령, 14-21일령, 35-42일령' },
  ]

  const completedChickens = filteredChickens.filter(c => c[selectedVaccine])
  const pendingChickens = filteredChickens.filter(c => !c[selectedVaccine])

  const handleSelectAll = (e, isPending) => {
    const targetChickens = isPending ? pendingChickens : completedChickens
    if (e.target.checked) {
      const newIds = [...selectedIds, ...targetChickens.map(c => c.id)]
      setSelectedIds([...new Set(newIds)])
    } else {
      const targetIds = targetChickens.map(c => c.id)
      setSelectedIds(selectedIds.filter(id => !targetIds.includes(id)))
    }
  }

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleMarkCompleted = () => {
    setChickens(chickens.map(c =>
      selectedIds.includes(c.id) ? { ...c, [selectedVaccine]: true } : c
    ))
    setSelectedIds([])
  }

  const handleMarkPending = () => {
    setChickens(chickens.map(c =>
      selectedIds.includes(c.id) ? { ...c, [selectedVaccine]: false } : c
    ))
    setSelectedIds([])
  }

  const selectedVaccineInfo = vaccineOptions.find(v => v.value === selectedVaccine)
  const selectedBatchInfo = batches.find(b => b.id === selectedBatch)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>💉 예방 접종 관리</h1>
            <p className={styles.subtitle}>닭 개체별 예방 접종 현황을 확인하고 관리합니다</p>
          </div>
          <button className={styles.btnList} onClick={() => navigate('/home/inoculation-list')}>
            📋 접종 리스트 보기
          </button>
        </div>

        <div className={styles.batchSelector}>
          <label className={styles.batchLabel}>배치 선택</label>
          <select
            className={styles.batchSelect}
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(Number(e.target.value))
              setSelectedIds([])
            }}
          >
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>
                {batch.name} (시작일: {batch.startDate}, {batch.chickenCount}마리)
              </option>
            ))}
          </select>
        </div>

        <div className={styles.vaccineSelector}>
          <label className={styles.vaccineLabel}>접종 질병 선택</label>
          <select
            className={styles.vaccineSelect}
            value={selectedVaccine}
            onChange={(e) => {
              setSelectedVaccine(e.target.value)
              setSelectedIds([])
            }}
          >
            {vaccineOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className={styles.vaccineSchedule}>
            📅 접종 스케줄: {selectedVaccineInfo.schedule}
          </div>
        </div>

        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>배치 전체</div>
            <div className={styles.statValue}>{filteredChickens.length}마리</div>
          </div>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <div className={styles.statLabel}>접종 예정</div>
            <div className={styles.statValue}>{pendingChickens.length}마리</div>
          </div>
          <div className={`${styles.statCard} ${styles.completed}`}>
            <div className={styles.statLabel}>접종 완료</div>
            <div className={styles.statValue}>{completedChickens.length}마리</div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.leftControls}>
          <button
            className={styles.btnSchedule}
            onClick={() => navigate('/home/inoculation-schedule')}
          >
            📅 접종 스케줄 보기
          </button>
          <div className={styles.selectInfo}>
            {selectedIds.length > 0 && (
              <span>{selectedIds.length}개 항목 선택됨</span>
            )}
          </div>
        </div>
        <div className={styles.actionButtons}>
          <button
            className={styles.btnComplete}
            onClick={handleMarkCompleted}
            disabled={selectedIds.length === 0}
          >
            ✓ 접종 완료 처리
          </button>
          <button
            className={styles.btnPending}
            onClick={handleMarkPending}
            disabled={selectedIds.length === 0}
          >
            ↺ 미완료 처리
          </button>
        </div>
      </div>

      <div className={styles.splitView}>
        {/* 접종 예정 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>⏱ 접종 예정 ({pendingChickens.length}마리)</h3>
            <input
              type="checkbox"
              checked={pendingChickens.length > 0 && pendingChickens.every(c => selectedIds.includes(c.id))}
              onChange={(e) => handleSelectAll(e, true)}
              className={styles.checkboxLarge}
            />
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxCol}></th>
                  <th>개체 번호</th>
                  <th>일령</th>
                  <th>체중 (kg)</th>
                </tr>
              </thead>
              <tbody>
                {pendingChickens.map(chicken => (
                  <tr
                    key={chicken.id}
                    className={selectedIds.includes(chicken.id) ? styles.selected : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(chicken.id)}
                        onChange={() => handleSelectOne(chicken.id)}
                      />
                    </td>
                    <td className={styles.tag}>{chicken.tag}</td>
                    <td>{chicken.age}일</td>
                    <td>{chicken.weight}</td>
                  </tr>
                ))}
                {pendingChickens.length === 0 && (
                  <tr>
                    <td colSpan="4" className={styles.emptyMessage}>
                      모든 개체가 접종을 완료했습니다 ✓
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 접종 완료 */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>✓ 접종 완료 ({completedChickens.length}마리)</h3>
            <input
              type="checkbox"
              checked={completedChickens.length > 0 && completedChickens.every(c => selectedIds.includes(c.id))}
              onChange={(e) => handleSelectAll(e, false)}
              className={styles.checkboxLarge}
            />
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxCol}></th>
                  <th>개체 번호</th>
                  <th>일령</th>
                  <th>체중 (kg)</th>
                </tr>
              </thead>
              <tbody>
                {completedChickens.map(chicken => (
                  <tr
                    key={chicken.id}
                    className={selectedIds.includes(chicken.id) ? styles.selected : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(chicken.id)}
                        onChange={() => handleSelectOne(chicken.id)}
                      />
                    </td>
                    <td className={styles.tag}>{chicken.tag}</td>
                    <td>{chicken.age}일</td>
                    <td>{chicken.weight}</td>
                  </tr>
                ))}
                {completedChickens.length === 0 && (
                  <tr>
                    <td colSpan="4" className={styles.emptyMessage}>
                      아직 접종을 완료한 개체가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChickenInoculation