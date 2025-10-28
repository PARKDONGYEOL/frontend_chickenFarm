import React, { useState, useEffect } from "react";
import styles from "./EnvSettings.module.css";
import { envSettingsAPI } from "../services/api";

const EnvSettings = () => {
  const [settings, setSettings] = useState({
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log("🔄 설정 로드 시작");
      const result = await envSettingsAPI.getSettings();
      
      console.log("📥 서버 응답:", result);
      
      if (result && result.success && result.data) {
        setSettings(prev => ({ ...prev, ...result.data }));
        console.log("✅ 설정 로드 성공:", result.data);
        setMessage("설정을 불러왔습니다.");
      } else if (result && result.data) {
        // success 필드가 없어도 data가 있으면 적용
        setSettings(prev => ({ ...prev, ...result.data }));
        console.log("✅ 설정 로드 성공 (data):", result.data);
      } else {
        console.error("❌ 설정 로드 실패:", result);
        setMessage("설정을 불러오는데 실패했습니다");
      }
    } catch (error) {
      console.error("❌ 설정 로드 중 오류:", error);
      setMessage("설정을 불러오는데 실패했습니다: " + error.message);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      console.log("💾 설정 저장 시작");
      console.log("📤 전송할 설정:", settings);
      
      // 1단계: 설정 저장
      const saveResult = await envSettingsAPI.updateSettings(settings);
      console.log("📥 저장 응답:", saveResult);
      
      if (!saveResult || !saveResult.success) {
        throw new Error("설정 저장 실패: " + (saveResult?.message || "응답 없음"));
      }
      
      setMessage("✅ 설정이 저장되었습니다. 라즈베리파이에 적용 중...");
      
      // 2단계: 약간의 딜레이 후 적용 (파이썬 서버가 파일을 쓰고 읽는 시간 필요)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("🚀 라즈베리파이에 설정 적용 요청");
      console.log("📤 저장된 설정:", settings);
      const applyResult = await envSettingsAPI.applySettings();
      console.log("📥 적용 응답:", applyResult);
      
      if (!applyResult) {
        throw new Error("적용 응답 없음");
      }
      
      // 적용 응답 상세 확인
      console.log("🔍 적용 응답 상세:", {
        success: applyResult.success,
        message: applyResult.message,
        data: applyResult.data
      });
      
      // 3단계: 현재 설정 확인 (재시도 로직)
      let currentSettings = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries && !currentSettings) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        
        console.log(`🔍 현재 설정 확인 (시도 ${retryCount + 1}/${maxRetries})`);
        try {
          currentSettings = await envSettingsAPI.getCurrentSettings();
          console.log("📥 현재 설정:", currentSettings);
        } catch (error) {
          console.log(`❌ 설정 확인 실패 (시도 ${retryCount + 1}):`, error.message);
          retryCount++;
        }
      }
      
      if (currentSettings && currentSettings.data) {
        const ledThreshold = currentSettings.data.manualLedThreshold;
        const autoMode = currentSettings.data.autoLedMode;
        const fanCO2Threshold = currentSettings.data.fanCO2Threshold;
        
        // 저장한 값과 현재 값 비교
        const savedFanCO2 = settings.fanCO2Threshold;
        const currentFanCO2 = currentSettings.data.fanCO2Threshold;
        
        if (savedFanCO2 === currentFanCO2) {
          setMessage(`✅ 설정이 완료되었습니다!\nLED 기준값: ${ledThreshold} lux\n자동모드: ${autoMode ? '활성' : '비활성'}\n팬 CO2 기준: ${fanCO2Threshold} ppm`);
          console.log(`✅ 라즈베리파이 적용 완료 - LED: ${ledThreshold}, 자동모드: ${autoMode}, 팬CO2: ${fanCO2Threshold}`);
        } else {
          setMessage(`⚠️ 설정 저장됨, 적용 실패\n저장값: ${savedFanCO2}, 현재값: ${currentFanCO2}\n\n🔧 해결 방법:\n1. 라즈베리파이 파이썬 서버 재시작\n2. 설정 파일 권한 확인\n3. 시스템 인스턴스 재로드`);
          console.log(`⚠️ 설정 불일치 - 저장: ${savedFanCO2}, 현재: ${currentFanCO2}`);
          console.log("🔧 파이썬 서버 재시작이 필요할 수 있습니다.");
        }
      } else {
        setMessage("✅ 설정이 적용되었습니다.");
        console.log("✅ 설정 적용 완료");
      }
    } catch (error) {
      console.error("❌ 오류 발생:", error);
      setMessage(`❌ 오류: ${error.message}`);
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
    let processedValue;
    
    if (key.includes('Hour')) {
      processedValue = parseInt(value) || 0;
    } else if (key.includes('Mode') || key.includes('Enabled')) {
      processedValue = value;
    } else {
      const numValue = parseFloat(value);
      processedValue = isNaN(numValue) ? settings[key] : numValue;
    }
    
    setSettings(prev => ({
      ...prev,
      [key]: processedValue
    }));
  };

  return (
    <div className={styles.container}>
      <h2>환경 설정</h2>
      
      {message && (
        <div className={`${styles.message} ${
          message.includes('✅') || message.includes('성공') || message.includes('완료') 
            ? styles.success 
            : styles.error
        }`}>
          {message.split('\n').map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}

      <div className={styles.settingsGrid}>
        {/* LED 조명 설정 */}
        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>💡 LED 조명 제어</h3>
          
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
              </div>
            </>
          )}

          {!settings.autoLedMode && (
            <div className={styles.settingItem}>
              <label>조도 기준 (lux)</label>
              <input
                type="number"
                value={settings.manualLedThreshold}
                onChange={(e) => handleChange('manualLedThreshold', e.target.value)}
                placeholder="300"
              />
            </div>
          )}
          
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
          </div>

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
          </div>
          <div className={styles.settingItem}>
            <label>문 닫기 온도 (°C)</label>
            <input
              type="number"
              value={settings.doorCloseTemp}
              onChange={(e) => handleChange('doorCloseTemp', e.target.value)}
              placeholder="15"
            />
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
          </div>
          <div className={styles.settingItem}>
            <label>팬 가동 CO2 기준 (ppm)</label>
            <input
              type="number"
              value={settings.fanCO2Threshold}
              onChange={(e) => handleChange('fanCO2Threshold', e.target.value)}
              placeholder="1000"
            />
          </div>
          <div className={styles.settingItem}>
            <label>팬 가동 CO 기준 (ppm)</label>
            <input
              type="number"
              value={settings.fanCOThreshold}
              onChange={(e) => handleChange('fanCOThreshold', e.target.value)}
              placeholder="30"
            />
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
          </div>
          <div className={styles.settingItem}>
            <label>저온 알림 기준 (°C)</label>
            <input
              type="number"
              value={settings.tempLowAlert}
              onChange={(e) => handleChange('tempLowAlert', e.target.value)}
              placeholder="10"
            />
          </div>
          <div className={styles.settingItem}>
            <label>고습도 알림 기준 (%)</label>
            <input
              type="number"
              value={settings.humidityHighAlert}
              onChange={(e) => handleChange('humidityHighAlert', e.target.value)}
              placeholder="85"
            />
          </div>
          <div className={styles.settingItem}>
            <label>저습도 알림 기준 (%)</label>
            <input
              type="number"
              value={settings.humidityLowAlert}
              onChange={(e) => handleChange('humidityLowAlert', e.target.value)}
              placeholder="30"
            />
          </div>
          <div className={styles.settingItem}>
            <label>CO2 알림 기준 (ppm)</label>
            <input
              type="number"
              value={settings.co2Alert}
              onChange={(e) => handleChange('co2Alert', e.target.value)}
              placeholder="2000"
            />
          </div>
          <div className={styles.settingItem}>
            <label>CO 알림 기준 (ppm)</label>
            <input
              type="number"
              value={settings.coAlert}
              onChange={(e) => handleChange('coAlert', e.target.value)}
              placeholder="50"
            />
          </div>
          <div className={styles.settingItem}>
            <label>NH3 알림 기준 (ppm)</label>
            <input
              type="number"
              value={settings.nh3Alert}
              onChange={(e) => handleChange('nh3Alert', e.target.value)}
              placeholder="25"
            />
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