import React, { useState } from "react";
import styles from "./EntityManagement.module.css";
import EntityModal from "./EntityModal";  // 📌 모달 불러오기

const EntityManagement = () => {
  const [activeTab, setActiveTab] = useState("chick"); // 기본 병아리 탭
  const [selectedEntity, setSelectedEntity] = useState(null); // 📌 선택된 개체 상태

  const chickData = [
    { id: "CH-001", type: "chick", age: "5일", weight: "120", feed: 30, water: 50, status: "정상" },
    { id: "CH-002", type: "chick", age: "7일", weight: "135", feed: 32, water: 55, status: "정상" },
  ];

  const chickenData = [
    { id: "CK-001", type: "chicken", age: "20주", weight: "2.1", feed: 120, water: 250, status: "정상" },
    { id: "CK-002", type: "chicken", age: "24주", weight: "2.4", feed: 125, water: 260, status: "정상" },
  ];

  return (
    <div className={styles.container}>
      <h2>개체 관리 페이지</h2>

      {/* 탭 버튼 */}
      <div className={styles.tabMenu}>
        <button
          className={activeTab === "chick" ? styles.active : ""}
          onClick={() => setActiveTab("chick")}
        >
          병아리 🐥
        </button>
        <button
          className={activeTab === "chicken" ? styles.active : ""}
          onClick={() => setActiveTab("chicken")}
        >
          닭 🐔
        </button>
      </div>

      {/* 탭 내용 */}
      <div className={styles.content}>
        {activeTab === "chick" && (
          <div>
            <h3>병아리 관리</h3>
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>나이(일)</th>
                  <th>체중(g)</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {chickData.map((chick) => (
                  <tr
                    key={chick.id}
                    onClick={() => setSelectedEntity(chick)} // 📌 클릭 시 모달 열기
                    style={{ cursor: "pointer" }}
                  >
                    <td>{chick.id}</td>
                    <td>{chick.age}</td>
                    <td>{chick.weight}</td>
                    <td>{chick.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "chicken" && (
          <div>
            <h3>성계 관리</h3>
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>나이(주)</th>
                  <th>체중(kg)</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {chickenData.map((chicken) => (
                  <tr
                    key={chicken.id}
                    onClick={() => setSelectedEntity(chicken)} // 📌 클릭 시 모달 열기
                    style={{ cursor: "pointer" }}
                  >
                    <td>{chicken.id}</td>
                    <td>{chicken.age}</td>
                    <td>{chicken.weight}</td>
                    <td>{chicken.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📌 모달 */}
      {selectedEntity && (
        <EntityModal
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
        />
      )}
    </div>
  );
};

export default EntityManagement