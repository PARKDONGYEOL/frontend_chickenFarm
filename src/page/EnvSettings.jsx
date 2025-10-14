import React, { useState, useEffect } from "react";
import styles from "./EnvSettings.module.css";
import { envSettingsAPI } from "../services/api";

const EnvSettings = () => {
  const [settings, setSettings] = useState({
    // LED 조명 기준
    ledThreshold: 300,
    autoLedMode: true,
    manualLedThreshold: 300,
    
    // 위치 정보
    locationLat: 37.5665,
    locationLng: 126.9780,
    
    // 수면 시간 설정
    sleepStartHour: 22,
    sleepEndHour: 6,
    sleepModeEnabled: true,
    
    // 서보모터 (문) 기준
    doorOpenTemp: 25,
    doorCloseTemp: 15,
    
    // 팬 기준
    fanHumidityThreshold: 75,
    fanCO2Threshold: 1000,
    fanCOThreshold: 30,
    fanSpeed: 60,
    
    // 위험 알림 기준
    tempHighAlert: 35,
    tempLowAlert: 10,
    humidityHighAlert: 85,
    humidityLowAlert: 30,
    co2Alert: 2000,
    coAlert: 50,
    nh3Alert: 25,
    
    // 환경 상태 점수 기준
    envStatusGood: 80,
    envStatusFair: 60
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await envSettingsAPI.getSettings();
      if (result.success && result.data) {
        setSettings({ ...settings, ...result.data });
        console.log("설정 로드 성공:", result.data);
      } else {
        console.error("설정 로드 실패:", result.message);
        setMessage("설정을 불러오는데 실패했습니다: " + result.message);
      }
    } catch (error) {
      console.error("설정 로드 실패:", error);
      setMessage("설정을 불러오는데 실패했습니다: " + error.message);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      console.log("저장할 설정:", settings);
      console.log("특히 LED 관련 설정:", {
        autoLedMode: settings.autoLedMode,
        manualLedThreshold: settings.manualLedThreshold,
        sleepModeEnabled: settings.sleepModeEnabled,
        sleepStartHour: settings.sleepStartHour,
        sleepEndHour: settings.sleepEndHour
      });
      
      const result = await envSettingsAPI.updateSettings(settings);
      console.log("저장 결과:", result);
      
      if (result.success) {
        setMessage("설정이 성공적으로 저장되었습니다.");
        
        // 백엔드를 통해 라즈베리파이에 적용 요청
        try {
          await envSettingsAPI.applySettings();
          console.log("라즈베리파이에 설정 적용 완료");
          
          // 현재 파이썬 서버의 설정 확인
          const currentSettings = await envSettingsAPI.getCurrentSettings();
          console.log("파이썬 서버의 현재 설정:", currentSettings);
          
          if (currentSettings.success) {
            const ledThreshold = currentSettings.data.manualLedThreshold;
            const autoMode = currentSettings.data.autoLedMode;
            setMessage(`설정 적용 완료! 현재 LED 기준값: ${ledThreshold} lux, 자동모드: ${autoMode}`);
            console.log(`LED 설정 확인 - 기준값: ${ledThreshold}, 자동모드: ${autoMode}`);
          } else {
            setMessage("설정이 저장되고 적용되었습니다.");
          }
        } catch (applyError) {
          console.error("라즈베리파이 적용 실패:", applyError);
          setMessage("설정은 저장되었지만 라즈베리파이 적용에 실패했습니다.");
        }
      } else {
        setMessage("설정 저장에 실패했습니다: " + result.message);
      }
    } catch (error) {
      console.error("설정 저장 실패:", error);
      setMessage("설정 저장 중 오류가 발생했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      ledThreshold: 300,
      autoLedMode: true,
      manualLedThreshold: 300,
      locationLat: 37.5665,
      locationLng: 126.9780,
      sleepStartHour: 22,
      sleepEndHour: 6,
      sleepModeEnabled: true,
      doorOpenTemp: 25,
      doorCloseTemp: 15,
      fanHumidityThreshold: 75,
      fanCO2Threshold: 1000,
      fanCOThreshold: 30,
      fanSpeed: 60,
      tempHighAlert: 35,
      tempLowAlert: 10,
      humidityHighAlert: 85,
      humidityLowAlert: 30,
      co2Alert: 2000,
      coAlert: 50,
      nh3Alert: 25,
      envStatusGood: 80,
      envStatusFair: 60
    });
    setMessage("");
  };

  const handleChange = (key, value) => {
    console.log(`handleChange 호출: key=${key}, value=${value}, type=${typeof value}`);
    
    let processedValue;
    
    if (key.includes('Hour')) {
      // 시간 필드는 정수
      processedValue = parseInt(value) || 0;
    } else if (key.includes('Mode') || key.includes('Enabled')) {
      // 불린 필드는 그대로
      processedValue = value;
    } else {
      // 숫자 필드는 실수로 변환, 빈 문자열이면 이전 값 유지
      const numValue = parseFloat(value);
      processedValue = isNaN(numValue) ? settings[key] : numValue;
    }
    
    console.log(`처리된 값: ${processedValue}, 이전 값: ${settings[key]}`);
    
    setSettings(prev => ({
      ...prev,
      [key]: processedValue
    }));
  };

  return (
    <div className={styles.container}>
      <h2>환경 설정</h2>
      
      {message && (
        <div className={`${styles.message} ${message.includes('성공') || message.includes('완료') || message.includes('적용') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      <div className={styles.settingsGrid}>
        {/* LED 조명 설정 */}
        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>💡 LED 조명 제어</h3>
          
          {/* 자동/수동 모드 선택 */}
          <div className={styles.settingItem}>
            <label>LED 모드</label>
            <div className={styles.toggleContainer}>
              <label className={styles.toggleLabel}>
                <input
                  type="radio"
                  name="ledMode"
                  checked={settings.autoLedMode}
                  onChange={() => setSettings(prev => ({ ...prev, autoLedMode: true }))}
                />
                <span className={styles.toggleText}>자동 (일몰/일출 기반)</span>
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="radio"
                  name="ledMode"
                  checked={!settings.autoLedMode}
                  onChange={() => setSettings(prev => ({ ...prev, autoLedMode: false }))}
                />
                <span className={styles.toggleText}>수동</span>
              </label>
            </div>
            <span className={styles.description}>
              자동 모드: 일몰/일출 시간에 따라 조도 기준이 자동 조정됩니다
            </span>
          </div>

          {/* 위치 정보 (자동 모드일 때만 표시) */}
          {settings.autoLedMode && (
            <>
              <div className={styles.settingItem}>
                <label>위도 (Latitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={settings.locationLat}
                  onChange={(e) => handleChange('locationLat', e.target.value)}
                  placeholder="37.5665"
                />
                <span className={styles.description}>
                  일몰/일출 시간 계산을 위한 위도
                </span>
              </div>
              <div className={styles.settingItem}>
                <label>경도 (Longitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={settings.locationLng}
                  onChange={(e) => handleChange('locationLng', e.target.value)}
                  placeholder="126.9780"
                />
                <span className={styles.description}>
                  일몰/일출 시간 계산을 위한 경도
                </span>
              </div>
            </>
          )}

          {/* 수동 조도 기준 (수동 모드일 때만 표시) */}
          {!settings.autoLedMode && (
            <div className={styles.settingItem}>
              <label>조도 기준 (lux)</label>
              <input
                type="number"
                value={settings.manualLedThreshold}
                onChange={(e) => handleChange('manualLedThreshold', e.target.value)}
                placeholder="300"
              />
              <span className={styles.description}>
                이 값 이하일 때 LED가 켜집니다
              </span>
            </div>
          )}
          
          {/* 수면 시간 설정 */}
          <div className={styles.settingItem}>
            <label>수면 모드</label>
            <div className={styles.toggleContainer}>
              <label className={styles.toggleLabel}>
                <input
                  type="radio"
                  name="sleepMode"
                  checked={settings.sleepModeEnabled}
                  onChange={() => setSettings(prev => ({ ...prev, sleepModeEnabled: true }))}
                />
                <span className={styles.toggleText}>활성화</span>
              </label>
              <label className={styles.toggleLabel}>
                <input
                  type="radio"
                  name="sleepMode"
                  checked={!settings.sleepModeEnabled}
                  onChange={() => setSettings(prev => ({ ...prev, sleepModeEnabled: false }))}
                />
                <span className={styles.toggleText}>비활성화</span>
              </label>
            </div>
            <span className={styles.description}>
              수면 시간에는 LED가 강제로 꺼집니다
            </span>
          </div>

          {/* 수면 시간 설정 (수면 모드가 활성화된 경우만 표시) */}
          {settings.sleepModeEnabled && (
            <>
              <div className={styles.settingItem}>
                <label>수면 시작 시간</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={settings.sleepStartHour}
                  onChange={(e) => handleChange('sleepStartHour', e.target.value)}
                  placeholder="22"
                />
                <span className={styles.description}>
                  수면 시작 시간 (24시간 형식, 0-23)
                </span>
              </div>
              <div className={styles.settingItem}>
                <label>수면 종료 시간</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={settings.sleepEndHour}
                  onChange={(e) => handleChange('sleepEndHour', e.target.value)}
                  placeholder="6"
                />
                <span className={styles.description}>
                  수면 종료 시간 (24시간 형식, 0-23)
                </span>
              </div>
            </>
          )}
        </div>

        {/* 서보모터 (문) 설정 */}
        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>🚪 문 제어</h3>
          <div className={styles.settingItem}>
            <label>문 열기 온도 (°C)</label>
            <input
              type="number"
              value={settings.doorOpenTemp}
              onChange={(e) => handleChange('doorOpenTemp', e.target.value)}
              placeholder="25"
            />
            <span className={styles.description}>
              이 온도 이상일 때 문이 열립니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>문 닫기 온도 (°C)</label>
            <input
              type="number"
              value={settings.doorCloseTemp}
              onChange={(e) => handleChange('doorCloseTemp', e.target.value)}
              placeholder="15"
            />
            <span className={styles.description}>
              이 온도 이하일 때 문이 닫힙니다
            </span>
          </div>
        </div>

        {/* 팬 제어 설정 */}
        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>🌀 팬 제어</h3>
          <div className={styles.settingItem}>
            <label>팬 가동 습도 기준 (%)</label>
            <input
              type="number"
              value={settings.fanHumidityThreshold}
              onChange={(e) => handleChange('fanHumidityThreshold', e.target.value)}
              placeholder="75"
            />
            <span className={styles.description}>
              이 습도 이상일 때 팬이 가동됩니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>팬 가동 CO2 기준 (ppm)</label>
            <input
              type="number"
              value={settings.fanCO2Threshold}
              onChange={(e) => handleChange('fanCO2Threshold', e.target.value)}
              placeholder="1000"
            />
            <span className={styles.description}>
              이 CO2 농도 초과 시 팬이 가동됩니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>팬 가동 CO 기준 (ppm)</label>
            <input
              type="number"
              value={settings.fanCOThreshold}
              onChange={(e) => handleChange('fanCOThreshold', e.target.value)}
              placeholder="30"
            />
            <span className={styles.description}>
              이 CO 농도 초과 시 팬이 가동됩니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>팬 속도 (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.fanSpeed}
              onChange={(e) => handleChange('fanSpeed', e.target.value)}
              placeholder="60"
            />
            <span className={styles.description}>
              팬 가동 시 출력 비율 (0-100%)
            </span>
          </div>
        </div>

        {/* 위험 알림 설정 */}
        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>⚠️ 위험 알림 기준</h3>
          <div className={styles.settingItem}>
            <label>고온 알림 기준 (°C)</label>
            <input
              type="number"
              value={settings.tempHighAlert}
              onChange={(e) => handleChange('tempHighAlert', e.target.value)}
              placeholder="35"
            />
            <span className={styles.description}>
              이 온도 이상일 때 고온 알림이 발생합니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>저온 알림 기준 (°C)</label>
            <input
              type="number"
              value={settings.tempLowAlert}
              onChange={(e) => handleChange('tempLowAlert', e.target.value)}
              placeholder="10"
            />
            <span className={styles.description}>
              이 온도 이하일 때 저온 알림이 발생합니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>고습도 알림 기준 (%)</label>
            <input
              type="number"
              value={settings.humidityHighAlert}
              onChange={(e) => handleChange('humidityHighAlert', e.target.value)}
              placeholder="85"
            />
            <span className={styles.description}>
              이 습도 이상일 때 고습도 알림이 발생합니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>저습도 알림 기준 (%)</label>
            <input
              type="number"
              value={settings.humidityLowAlert}
              onChange={(e) => handleChange('humidityLowAlert', e.target.value)}
              placeholder="30"
            />
            <span className={styles.description}>
              이 습도 이하일 때 저습도 알림이 발생합니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>CO2 알림 기준 (ppm)</label>
            <input
              type="number"
              value={settings.co2Alert}
              onChange={(e) => handleChange('co2Alert', e.target.value)}
              placeholder="2000"
            />
            <span className={styles.description}>
              이 CO2 농도 초과 시 알림이 발생합니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>CO 알림 기준 (ppm)</label>
            <input
              type="number"
              value={settings.coAlert}
              onChange={(e) => handleChange('coAlert', e.target.value)}
              placeholder="50"
            />
            <span className={styles.description}>
              이 CO 농도 초과 시 알림이 발생합니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>NH3 알림 기준 (ppm)</label>
            <input
              type="number"
              value={settings.nh3Alert}
              onChange={(e) => handleChange('nh3Alert', e.target.value)}
              placeholder="25"
            />
            <span className={styles.description}>
              이 NH3 농도 초과 시 알림이 발생합니다
            </span>
          </div>
        </div>

        {/* 환경 상태 점수 기준 */}
        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>📊 환경 상태 점수 기준</h3>
          <div className={styles.settingItem}>
            <label>양호 기준 (점)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.envStatusGood}
              onChange={(e) => handleChange('envStatusGood', e.target.value)}
              placeholder="80"
            />
            <span className={styles.description}>
              이 점수 이상일 때 환경 상태가 "양호"로 표시됩니다
            </span>
          </div>
          <div className={styles.settingItem}>
            <label>좋음 기준 (점)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.envStatusFair}
              onChange={(e) => handleChange('envStatusFair', e.target.value)}
              placeholder="60"
            />
            <span className={styles.description}>
              이 점수 이상일 때 환경 상태가 "좋음"으로 표시됩니다
            </span>
          </div>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button 
          className={styles.saveButton}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "저장 중..." : "설정 저장 및 적용"}
        </button>
        <button 
          className={styles.resetButton}
          onClick={handleReset}
          disabled={loading}
        >
          기본값으로 초기화
        </button>
      </div>
    </div>
  );
};

export default EnvSettings;
