import React, { useState, useEffect } from "react";
import styles from "./Diary.module.css";
import * as noteApi from "../api/noteApi";

const Diary = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newEntry, setNewEntry] = useState({
    content: "",
  });

  // 로그인된 사용자 ID (임시로 하드코딩, 실제로는 로그인 정보에서 가져와야 함)
  const memId = sessionStorage.getItem('loginInfo')
    ? JSON.parse(sessionStorage.getItem('loginInfo')).memId
    : 'admin';

  // 날짜 변경 시 해당 날짜의 일지 조회
  useEffect(() => {
    fetchNotesByDate();
  }, [selectedDate]);

  // 특정 날짜의 일지 조회
  const fetchNotesByDate = async () => {
    try {
      const data = await noteApi.getNotesByDate(memId, selectedDate);
      setEntries(data);
    } catch (error) {
      console.error('일지 조회 실패:', error);
      setEntries([]);
    }
  };

  const handleAddEntry = async () => {
    if (editingId) {
      // 수정 모드
      try {
        const noteData = {
          noteNum: editingId,
          content: newEntry.content,
        };
        const result = await noteApi.updateNote(noteData);

        if (result.success) {
          alert(result.message);
          fetchNotesByDate(); // 목록 새로고침
          setEditingId(null);
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert('일지 수정에 실패했습니다.');
        console.error(error);
      }
    } else {
      // 추가 모드
      try {
        const noteData = {
          memId: memId,
          content: newEntry.content,
        };
        const result = await noteApi.insertNote(noteData);

        if (result.success) {
          alert(result.message);
          fetchNotesByDate(); // 목록 새로고침
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert('일지 추가에 실패했습니다.');
        console.error(error);
      }
    }
    setNewEntry({
      content: "",
    });
    setShowForm(false);
  };

  const handleEdit = (entry) => {
    setNewEntry({
      content: entry.content,
    });
    setEditingId(entry.noteNum);
    setShowForm(true);
  };

  const handleDelete = async (noteNum) => {
    if (window.confirm("이 기록을 삭제하시겠습니까?")) {
      try {
        const result = await noteApi.deleteNote(noteNum);

        if (result.success) {
          alert(result.message);
          fetchNotesByDate(); // 목록 새로고침
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert('일지 삭제에 실패했습니다.');
        console.error(error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setNewEntry({
      content: "",
    });
  };

  const filteredEntries = entries;

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
              <div key={entry.noteNum} className={styles.entryCard}>
                <div className={styles.entryContent}>
                  {entry.content}
                </div>
                <div className={styles.entryFooter}>
                  <div className={styles.entryFooterLeft}>
                    <span>📅 {new Date(entry.recTime).toLocaleString('ko-KR')}</span>
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
                      onClick={() => handleDelete(entry.noteNum)}
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
