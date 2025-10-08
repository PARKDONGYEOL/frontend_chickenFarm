import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Settings.module.css";

const Settings = () => {
  const nav = useNavigate();
  const [loginInfo, setLoginInfo] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const info = sessionStorage.getItem("loginInfo");
    if (info) {
      const parsedInfo = JSON.parse(info);
      setLoginInfo(parsedInfo);
      setNewUsername(parsedInfo.name);
    } else {
      nav("/");
    }
  }, [nav]);

  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 4) {
      setMessage("비밀번호는 최소 4자 이상이어야 합니다.");
      return;
    }

    // 스프링 서버로 비밀번호 변경 요청
    axios.put('/api/member/password', {
      memId: loginInfo.memId,
      currentPassword: currentPassword,
      newPassword: newPassword
    })
    .then(res => {
      console.log("응답:", res.data);
      if (res.data.success) {
        setMessage("비밀번호가 변경되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(res.data.message || "비밀번호 변경에 실패했습니다.");
      }
    })
    .catch(err => {
      console.error("에러:", err);
      setMessage("비밀번호 변경 중 오류가 발생했습니다.");
    });
  };

  const handleUsernameChange = (e) => {
    e.preventDefault();

    if (!newUsername.trim()) {
      setMessage("아이디를 입력해주세요.");
      return;
    }

    // 스프링 서버로 아이디(이름) 변경 요청
    axios.put('/api/member/name', {
      memId: loginInfo.memId,
      newName: newUsername
    })
    .then(res => {
      console.log("응답:", res.data);
      if (res.data.success) {
        const updatedInfo = { ...loginInfo, name: newUsername };
        sessionStorage.setItem("loginInfo", JSON.stringify(updatedInfo));
        setLoginInfo(updatedInfo);
        setMessage("아이디가 변경되었습니다.");
      } else {
        setMessage(res.data.message || "아이디 변경에 실패했습니다.");
      }
    })
    .catch(err => {
      console.error("에러:", err);
      setMessage("아이디 변경 중 오류가 발생했습니다.");
    });
  };

  if (!loginInfo) return null;

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <button onClick={() => nav("/home")} className={styles.backButton}>
          ← 뒤로가기
        </button>
        <h1>설정</h1>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.settingsContent}>
        {/* 아이디 변경 섹션 */}
        <div className={styles.section}>
          <h2>아이디 변경</h2>
          <form onSubmit={handleUsernameChange}>
            <div className={styles.formGroup}>
              <label>현재 아이디</label>
              <input
                type="text"
                value={loginInfo.name}
                disabled
                className={styles.disabledInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>새 아이디</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="새 아이디를 입력하세요"
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              아이디 변경
            </button>
          </form>
        </div>

        {/* 비밀번호 변경 섹션 */}
        <div className={styles.section}>
          <h2>비밀번호 변경</h2>
          <form onSubmit={handlePasswordChange}>
            <div className={styles.formGroup}>
              <label>현재 비밀번호</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>
            <div className={styles.formGroup}>
              <label>새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
              />
            </div>
            <div className={styles.formGroup}>
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              비밀번호 변경
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;