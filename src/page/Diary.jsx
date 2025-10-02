import React, { useState } from "react";
import styles from "./Diary.module.css";

const Diary = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: "2025-10-02",
      time: "09:30",
      observer: "김담당",
      category: "건강",
      content: "전체적으로 양호한 상태. 활동량이 정상적임.",
      temperature: 24.5,
      humidity: 62,
    },
    {
      id: 2,
      date: "2025-10-02",
      time: "14:20",
      observer: "이관리",
      category: "사료",
      content: "사료 급여 완료. 잔여량 확인.",
      temperature: 25.1,
      humidity: 58,
    },
    {
      id: 3,
      date: "2025-10-01",
      time: "10:15",
      observer: "김담당",
      category: "청소",
      content: "사육장 청소 및 소독 완료.",
      temperature: 23.8,
      humidity: 65,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newEntry, setNewEntry] = useState({
    time: new Date().toTimeString().slice(0, 5),
    observer: "",
    category: "건강",
    content: "",
  });

  const handleAddEntry = () => {
    if (editingId) {
      // 수정 모드
      setEntries(entries.map(entry =>
        entry.id === editingId
          ? { ...entry, ...newEntry }
          : entry
      ));
      setEditingId(null);
    } else {
      // 추가 모드
      const entry = {
        id: Date.now(),
        date: selectedDate,
        ...newEntry,
        temperature: 24.5,
        humidity: 60,
      };
      setEntries([entry, ...entries]);
    }
    setNewEntry({
      time: new Date().toTimeString().slice(0, 5),
      observer: "",
      category: "건강",
      content: "",
    });
    setShowForm(false);
  };

  const handleEdit = (entry) => {
    setNewEntry({
      time: entry.time,
      observer: entry.observer,
      category: entry.category,
      content: entry.content,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("이 기록을 삭제하시겠습니까?")) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setNewEntry({
      time: new Date().toTimeString().slice(0, 5),
      observer: "",
      category: "건강",
      content: "",
    });
  };

  const filteredEntries = entries.filter(entry => entry.date === selectedDate);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>관찰 일지</h2>
          <p className={styles.subtitle}>일일 사육 기록</p>
        </div>
        <div className={styles.headerRight}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={styles.datePicker}
          />
          <button
            className={styles.addButton}
            onClick={() => setShowForm(!showForm)}
          >
            + 기록 추가
          </button>
        </div>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>{editingId ? "관찰 기록 수정" : "새 관찰 기록"}</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>시간</label>
              <input
                type="time"
                value={newEntry.time}
                onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>관찰자</label>
              <input
                type="text"
                value={newEntry.observer}
                onChange={(e) => setNewEntry({ ...newEntry, observer: e.target.value })}
                placeholder="이름 입력"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>카테고리</label>
              <select
                value={newEntry.category}
                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                className={styles.select}
              >
                <option value="건강">건강</option>
                <option value="사료">사료</option>
                <option value="청소">청소</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>관찰 내용</label>
            <textarea
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              placeholder="상세 내용을 입력하세요"
              className={styles.textarea}
              rows={4}
            />
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              취소
            </button>
            <button className={styles.saveButton} onClick={handleAddEntry}>
              {editingId ? "수정" : "저장"}
            </button>
          </div>
        </div>
      )}

      <div className={styles.entriesContainer}>
        <div className={styles.entriesHeader}>
          <h3 className={styles.entriesTitle}>
            {selectedDate} 기록 ({filteredEntries.length}건)
          </h3>
        </div>

        {filteredEntries.length === 0 ? (
          <div className={styles.emptyState}>
            <p>📝 이 날짜에 등록된 기록이 없습니다.</p>
          </div>
        ) : (
          <div className={styles.entriesList}>
            {filteredEntries.map((entry) => (
              <div key={entry.id} className={styles.entryCard}>
                <div className={styles.entryHeader}>
                  <div className={styles.entryTime}>
                    {entry.time}
                  </div>
                  <div className={styles.entryMeta}>
                    <span className={styles.categoryBadge}>{entry.category}</span>
                    <span className={styles.observer}>{entry.observer}</span>
                  </div>
                </div>
                <div className={styles.entryContent}>
                  {entry.content}
                </div>
                <div className={styles.entryFooter}>
                  <div className={styles.entryFooterLeft}>
                    <span>🌡️ {entry.temperature}°C</span>
                    <span>💧 {entry.humidity}%</span>
                  </div>
                  <div className={styles.entryActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(entry)}
                    >
                      수정
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(entry.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;
