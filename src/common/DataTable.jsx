import React from "react";
import styles from "./DataTable.module.css";

/**
 * 📊 공용 테이블 컴포넌트
 * props:
 * - columns: [{ key: "time", label: "시간" }, ...]
 * - data: [{ time: "2025-09-26 12:00", value: 23.5 }]
 * - limit: 최대 표시 행 수 (기본 5)
 * - title: (선택) 테이블 제목
 */
const DataTable = ({ columns = [], data = [], limit = 5, title }) => {
  const rows = data.slice(-limit).reverse(); // 최근 데이터 5개 (기본)

  return (
    <div className={styles.tableWrapper}>
      {title && <h4 className={styles.title}>{title}</h4>}
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>데이터가 없습니다.</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable