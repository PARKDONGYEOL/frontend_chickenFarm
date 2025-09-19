import React, { useRef, useEffect, useState } from "react";
import styles from "./EntityModal.module.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const EntityModal = ({ entity, onClose }) => {
  const contentRef = useRef(null); // 📌 제목+표+전체 영역
  const [contentHeight, setContentHeight] = useState(300);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.offsetHeight); // 실제 높이
    }
  }, [entity]);

  if (!entity) return null;

  const weightUnit = entity.type === "chicken" ? "kg" : "g";

  const comparisonData = [
    {
      time: "어제",
      feed: entity.feedYesterday || entity.feed - 2,
      water: entity.waterYesterday || entity.water - 5,
      weight:
        entity.weightYesterday ||
        (entity.type === "chicken"
          ? parseFloat(entity.weight) - 0.1
          : parseInt(entity.weight) - 5),
    },
    {
      time: "오늘",
      feed: entity.feed,
      water: entity.water,
      weight:
        entity.type === "chicken"
          ? parseFloat(entity.weight)
          : parseInt(entity.weight),
    },
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{entity.id} 상세 정보</h3>

        <div className={styles.contentRow} ref={contentRef}>
          {/* 📋 표 */}
          <table className={styles.infoTable}>
            <tbody>
              {entity.age && (
                <tr>
                  <th>나이</th>
                  <td>{entity.age}</td>
                </tr>
              )}
              {entity.weight && (
                <tr>
                  <th>체중</th>
                  <td>{entity.weight} {weightUnit}</td>
                </tr>
              )}
              {entity.feed && (
                <tr>
                  <th>먹이 섭취량</th>
                  <td>{entity.feed} g</td>
                </tr>
              )}
              {entity.water && (
                <tr>
                  <th>물 섭취량</th>
                  <td>{entity.water} ml</td>
                </tr>
              )}
              <tr>
                <th>상태</th>
                <td>{entity.status}</td>
              </tr>
            </tbody>
          </table>

          {/* 📊 차트 (제목 + 표 높이에 맞춤) */}
          <div className={styles.chartBox} style={{ height: contentHeight }}>
            <ResponsiveContainer>
              <BarChart
                data={comparisonData}
                margin={{ top: 30, right: 40, left: 60, bottom: 20 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  label={{
                    value: "먹이(g) / 물(ml)",
                    angle: 0,
                    position: "top",
                    dy: -10,
                    fill: "#fff",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: `체중(${weightUnit})`,
                    angle: 0,
                    position: "top",
                    dy: -10,
                    fill: "#fff",
                  }}
                />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="feed" name="먹이(g)" fill="#ff4d4d" />
                <Bar yAxisId="left" dataKey="water" name="물(ml)" fill="#4d79ff" />
                <Bar yAxisId="right" dataKey="weight" name={`체중(${weightUnit})`} fill="#4dff4d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ textAlign: "right", marginTop: "15px" }}>
          <button onClick={onClose} className={styles.closeBtn}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default EntityModal