# 🐔 스마트 양계장 관리 시스템

React + Vite 기반의 양계장 환경 모니터링 및 관리 시스템입니다.

## 🚀 기술 스택

- **Frontend**: React 18 + Vite
- **Backend**: Spring Boot + MariaDB
- **IoT**: Python (Flask) + Raspberry Pi
- **UI/UX**: CSS Modules

## 📋 주요 기능

- 🌡️ **실시간 환경 모니터링**: 온도, 습도, 조도, CO, NH3 센서 데이터
- 🔔 **위험 알림 시스템**: 임계값 초과 시 자동 알림
- 📊 **데이터 분석**: 일일/주간 통계 및 트렌드 분석
- 💡 **스마트 LED 제어**: 자동/수동 모드, 수면 시간 설정
- 📝 **관찰일지**: 일일 관찰 기록 관리
- 💉 **백신 관리**: 접종 스케줄 및 기록
- 📹 **CCTV 모니터링**: 실시간 영상 감시

---

## 📚 일일 학습 기록

### 📅 2025년 10월 13일 (월)

#### 📖 교시별 학습 내용

##### 1교시 (09:00 - 09:50)

- **학습 내용:** React Native Stack Navigation 기초
- **구현한 기능/코드:**
    - Expo Router 기반 네비게이션 구조 설정
    - Stack Navigation 라우팅 시스템 구현

##### 2교시 (10:00 - 10:50)

- **학습 내용:** React Native 페이지 이동 및 파라미터 전달
- **구현한 기능/코드:**

```jsx
// HomeScreen - 페이지 이동 구현
const router = useRouter();

<Pressable
  onPress={() => router.push({
    pathname: '/detail',
    params: { id: 'asdf', age: 20 }
  })}
>
  <Text>to detail page</Text>
</Pressable>

// DetailScreen - 파라미터 받기
const params = useLocalSearchParams();
<Text>{params.id}</Text>
<Text>{params.age}</Text>
```

##### 3교시 (11:00 - 11:50)

- **학습 내용:** 양계장 프로젝트 - 위험 알림 기록 페이지 구현
- **구현한 기능/코드:**
    - AlertHistory 페이지 신규 생성
    - 날짜/시간/카테고리 검색 필터 기능
    - DataTable 컴포넌트 연동

##### 4교시 (12:00 - 12:50)

- **학습 내용:** 알림 기록 UI 개선 및 검색 기능 고도화
- **구현한 기능/코드:**

```jsx
// 검색 필터링 로직
const filterAlerts = () => {
  let filtered = [...alerts];
  
  // 날짜 범위 필터링
  if (startDate) {
    filtered = filtered.filter(alert => {
      const alertDate = new Date(alert.recTime);
      return alertDate >= new Date(startDate);
    });
  }
  
  // 카테고리 필터링
  if (searchCategory) {
    filtered = filtered.filter(alert => 
      alert.noticeCategory.toLowerCase().includes(searchCategory.toLowerCase())
    );
  }
  
  setFilteredAlerts(filtered);
}
```

##### 🍽️ 점심시간 (13:00 - 13:50)

##### 5교시 (14:00 - 14:50)

- **학습 내용:** 관찰일지(Diary) 기능 구현
- **구현한 기능/코드:**
    - 일일 관찰 기록 CRUD 기능
    - 날짜별 관찰 내용 입력/수정/삭제
    - 관찰자, 카테고리(건강/사료/청소), 온습도 기록

##### 6교시 (15:00 - 15:50)

- **학습 내용:** 환경 설정 페이지 UI/UX 개선
- **구현한 기능/코드:**
    - EnvSettings 페이지 스타일 개선
    - LED 조명 자동/수동 모드 토글 기능
    - 닭 수면 시간 설정 기능 추가

##### 7교시 (16:00 - 16:50)

- **학습 내용:** 파이썬 환경 모니터링 코드 최적화
- **구현한 기능:**
    - env_monitor_simple.py 간소화 버전 작성 (1200줄 → 200줄)
    - Flask API 서버 분리 구현
    - 설정 실시간 업데이트 기능 추가

```python
# Flask API - 설정 업데이트
@app.route('/api/settings/update', methods=['POST'])
def update_settings():
    global current_settings
    data = request.json
    
    # 백엔드에 먼저 저장 시도
    try:
        requests.post('http://192.168.30.152:8080/api/env-settings', json=data)
    except:
        logger.warning('백엔드 저장 실패, 로컬만 업데이트')
    
    # 로컬 설정 업데이트
    current_settings.update(data)
    logger.info(f'설정 업데이트: {data}')
    
    return jsonify({'success': True})
```

##### 8교시 (17:00 - 17:50)

- **학습 내용:** 환경 모니터링 LED 제어 로직 개선
- **구현한 기능/코드:**

```python
def control_led(self, lux):
    if not self.LED_PIN:
        return "OFF (하드웨어 없음)"
    
    now = datetime.now()
    sleep_start = current_settings.get('sleepStartHour', 22)
    sleep_end = current_settings.get('sleepEndHour', 6)
    sleep_enabled = current_settings.get('sleepModeEnabled', True)
    
    # 수면 시간 체크
    if sleep_enabled:
        if sleep_start > sleep_end:
            if now.hour >= sleep_start or now.hour < sleep_end:
                GPIO.output(self.LED_PIN, GPIO.LOW)
                return "OFF (수면시간)"
    
    # 자동/수동 모드
    auto_mode = current_settings.get('autoLedMode', False)
    threshold = 300 if auto_mode else current_settings.get('manualLedThreshold', 700)
    
    if lux <= threshold:
        GPIO.output(self.LED_PIN, GPIO.HIGH)
        return f"ON (조도: {lux} <= {threshold})"
    else:
        GPIO.output(self.LED_PIN, GPIO.LOW)
        return f"OFF (조도: {lux} > {threshold})"
```

---

#### ✅ 오늘 완료한 것

- [x]  React Native Stack Navigation 학습 및 실습
- [x]  위험 알림 기록 페이지 구현 (AlertHistory)
- [x]  관찰일지 기능 구현 (Diary)
- [x]  환경 설정 UI/UX 개선
- [x]  파이썬 코드 최적화 (1200줄 → 200줄)
- [x]  LED 제어 로직 개선 (수면 모드, 자동/수동 모드)
- [x]  Flask API 실시간 설정 업데이트 기능

#### 💡 배운 개념 & 메모

**React Native**

- **useRouter()**: Expo Router의 페이지 이동 훅
    - `push()`: 페이지 스택에 추가
    - `replace()`: 현재 페이지 교체
    - `navigate()`: 조건부 네비게이션
- **useLocalSearchParams()**: URL 파라미터 받기
- **SafeAreaView**: 안전 영역 처리 (노치/상태바)

**Python 최적화**

- 코드 간소화로 **성능 6배 향상** (라즈베리파이 메모리 부담 감소)
- 하드웨어 없이도 Flask API 서버 실행 가능하게 분리
- 설정 변경 시 재시작 불필요 (실시간 업데이트)

**프론트엔드-백엔드-파이썬 통신**

- Frontend → Spring Boot → MariaDB
- Frontend → Python Flask (fallback)
- 설정 변경 시 두 경로 모두 시도하여 안정성 확보

#### 🔄 내일 할 일

- [x]  위험 알림 자동 팝업 기능 구현
- [ ]  관찰일지 이미지 첨부 기능 추가
- [ ]  React Native 앱 심화 학습 (Bottom Tabs)
- [ ]  환경 설정 데이터 검증 로직 강화

---

**오늘의 한마디:**  
AI는 신이야... 아니다 바보임 ㅋㅋ

---

## 🛠️ 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 📱 IoT 모니터링 시작

```bash
# Python 환경 모니터링 실행
python env_monitor_simple.py
```

## 📄 라이선스

This project is licensed under the MIT License.
