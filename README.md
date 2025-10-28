# 🐔 Smart Chicken Farm Management System

IoT 기반 스마트 양계장 통합 관리 시스템

실시간 환경 모니터링, 자동 제어, 데이터 분석을 통한 효율적인 양계장 운영 솔루션입니다.

## 📑 목차

- [기술 스택](#-기술-스택)
- [시스템 아키텍처](#-시스템-아키텍처)
- [주요 기능](#-주요-기능)
- [설치 및 실행](#️-설치-및-실행)
- [프로젝트 구조](#-프로젝트-구조)
- [API 문서](#-api-문서)
- [환경 설정](#-환경-설정)

## 🚀 기술 스택

### Frontend (Web)
- **Framework**: React 18.3
- **Build Tool**: Vite 6.0
- **Routing**: React Router DOM 7.0
- **State Management**: Redux Toolkit
- **Charts**: Chart.js, Recharts
- **Styling**: CSS Modules
- **HTTP Client**: Axios

### Frontend (Mobile)
- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **Storage**: Expo SecureStore

### Backend
- **Framework**: Spring Boot 3.x
- **Database**: MariaDB
- **ORM**: MyBatis
- **Build Tool**: Maven
- **API**: RESTful API

### IoT
- **Platform**: Raspberry Pi
- **Language**: Python 3.x
- **Framework**: Flask
- **Sensors**: DHT22 (온습도), MQ-135 (CO2), MQ-7 (CO), MQ-137 (NH3), BH1750 (조도)
- **Actuators**: LED, Servo Motor, Fan

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Client    │────▶│  Spring Boot    │────▶│    MariaDB      │
│   (React)       │     │   Backend       │     │   Database      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Mobile Client  │     │  Raspberry Pi   │
│ (React Native)  │     │  (Python/Flask) │
└─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   IoT Sensors   │
                        │   & Actuators   │
                        └─────────────────┘
```

## 📋 주요 기능

### 🌡️ 실시간 환경 모니터링
- 온도, 습도, 조도, CO2, CO, NH3 센서 데이터 실시간 수집
- 5초 간격 자동 업데이트
- 시각화된 대시보드 (게이지, 차트)

### 🔔 위험 알림 시스템
- 임계값 초과 시 자동 알림 팝업
- 알림 기록 저장 및 조회
- 카테고리별 필터링 (온도, 습도, CO2, CO, NH3, 조도)

### 📊 데이터 분석
- 일일/주간/월간 통계
- 트렌드 분석 차트
- 환경 점수 계산 (Good/Fair/Poor)

### 💡 스마트 제어
- **LED 조명**: 자동/수동 모드, 수면 시간 설정
- **환기 팬**: 습도/CO2/CO 기반 자동 제어
- **서보 모터**: 온도 기반 문 개폐

### 🐔 개체 관리
- 배치별 닭 개체 등록 및 관리
- 건강 상태 모니터링
- 폐사 처리 및 통계

### 💉 예방접종 관리
- 접종 스케줄 자동 생성
- 개체별/배치별 접종 기록
- 접종 이력 조회

### 📝 관찰일지
- 일일 관찰 기록 작성
- 카테고리별 분류 (건강, 사료, 청소)
- 온습도 자동 기록

### 📹 CCTV 모니터링
- 실시간 영상 스트리밍
- 녹화 영상 재생
- 알람 기록 연동

### ⚙️ 환경 설정
- 센서 임계값 설정
- 제어 장치 설정
- 수면 시간 설정
- 위치 정보 설정 (일출/일몰 계산)

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

### 1. Frontend (Web) 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 2. Backend (Spring Boot) 실행

```bash
# Maven 빌드
mvn clean install

# 애플리케이션 실행
mvn spring-boot:run

# 또는 JAR 파일 실행
java -jar target/chickenFarm-0.0.1-SNAPSHOT.jar
```

**Backend 서버**: `http://192.168.30.152:8080`

### 3. IoT (Raspberry Pi) 실행

```bash
# Python 의존성 설치
pip install flask requests RPi.GPIO Adafruit_DHT

# 환경 모니터링 시작
python env_monitor_simple.py

# 또는 백그라운드 실행
nohup python env_monitor_simple.py &
```

**Python 서버**: `http://192.168.30.240:5000`

### 4. Mobile (React Native) 실행

```bash
# 의존성 설치
npm install

# Expo 개발 서버 실행
npx expo start

# Android 실행
npx expo start --android

# iOS 실행
npx expo start --ios
```

## 📁 프로젝트 구조

```
frontend-chickenfarm/
├── src/
│   ├── api/              # API 호출 함수
│   ├── assets/           # 이미지, 아이콘
│   ├── common/           # 공통 컴포넌트
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── DataTable.jsx
│   │   └── ...
│   ├── context/          # React Context
│   │   └── AlertContext.jsx
│   ├── layout/           # 레이아웃 컴포넌트
│   │   ├── Header.jsx
│   │   ├── Login.jsx
│   │   └── cctv/
│   ├── page/             # 페이지 컴포넌트
│   │   ├── Home.jsx
│   │   ├── RealTimeMonitoring.jsx
│   │   ├── EnvDashboard.jsx
│   │   ├── TrendAnalysis.jsx
│   │   ├── ChickenManagement.jsx
│   │   ├── Diary.jsx
│   │   ├── ChickenInoculation.jsx
│   │   ├── AlertHistory.jsx
│   │   └── EnvSettings.jsx
│   ├── services/         # API 서비스
│   │   └── api.js
│   ├── utils/            # 유틸리티 함수
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
└── vite.config.js

backend-chickenfarm/
├── src/main/java/com/backend/chickenFarm/
│   ├── member/           # 회원 관리
│   ├── chicken/          # 개체 관리
│   ├── chicken_batch/    # 배치 관리
│   ├── chicken_farm/     # 농장 관리
│   ├── danger_notice/    # 위험 알림
│   ├── env_settings/     # 환경 설정
│   ├── farm_status/      # 농장 상태
│   ├── inoculation/      # 예방접종
│   ├── note/             # 관찰일지
│   └── sensor_th/        # 센서 데이터
├── src/main/resources/
│   ├── mapper/           # MyBatis XML
│   └── application.properties
└── pom.xml

app-chickenfarm/          # React Native 모바일 앱
├── app/
│   ├── authorization/
│   │   ├── signin.jsx
│   │   └── signup.jsx
│   └── (tabs)/
├── components/
└── package.json
```

## 📡 API 문서

### Backend API (Spring Boot)

**Base URL**: `http://192.168.30.152:8080/api`

#### 회원 관리
- `POST /member` - 로그인
- `PUT /member/password` - 비밀번호 변경
- `PUT /member/name` - 이름 변경
- `POST /member/signup` - 회원가입

#### 개체 관리
- `GET /chicken/{batchId}` - 배치별 개체 조회
- `PUT /chicken/death` - 폐사 처리
- `PUT /chicken/update-health` - 건강 상태 수정

#### 배치 관리
- `GET /batch/info` - 배치 정보 조회
- `POST /batch` - 배치 등록
- `PUT /batch/shipment` - 배치 출하

#### 예방접종
- `GET /inoculation/batch/{batchId}` - 배치별 개체 조회
- `POST /inoculation/perform` - 접종 실행
- `DELETE /inoculation/perform` - 접종 삭제
- `GET /inoculation/schedule/{batchId}` - 접종 스케줄 조회

#### 위험 알림
- `POST /danger/insert` - 알림 저장
- `GET /danger/list/{farmNum}` - 알림 목록 조회

#### 환경 설정
- `GET /env-settings` - 설정 조회
- `POST /env-settings` - 설정 저장

### Python API (Flask)

**Base URL**: `http://192.168.30.240:5000/api`

#### 센서 데이터
- `GET /realtime` - 실시간 센서 데이터
- `GET /sensor-history/{type}` - 센서 히스토리
- `GET /status` - 시스템 상태

#### 환경 설정
- `GET /settings/current` - 현재 설정 조회
- `POST /settings/update` - 설정 업데이트
- `POST /settings/apply` - 설정 적용

## ⚙️ 환경 설정

### 1. 데이터베이스 설정

```sql
-- database_schema.sql 실행
CREATE DATABASE team_db;
USE team_db;

-- 테이블 생성 스크립트 실행
SOURCE database_schema.sql;
```

### 2. Backend 설정

`src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:log4jdbc:mariadb://192.168.30.152:3306/team_db
spring.datasource.username=your_username
spring.datasource.password=your_password

server.servlet.context-path=/api
```

### 3. Frontend 설정

`src/services/api.js`:

```javascript
const PYTHON_SERVER = 'http://192.168.30.240:5000'
const BACKEND_SERVER = 'http://192.168.30.152:8080'
```

### 4. IoT 설정

`env_monitor_simple.py`:

```python
BACKEND_URL = 'http://192.168.30.152:8080/api/env-settings'
FLASK_PORT = 5000
```

## 🔐 기본 계정

- **ID**: admin
- **PW**: admin1234
- **Role**: ADMIN

## 🐛 트러블슈팅

### 로그인 실패
- 백엔드 서버 실행 확인: `http://192.168.30.152:8080/api/member`
- 네트워크 연결 확인
- 브라우저 콘솔에서 에러 확인

### 센서 데이터 수신 실패
- Python 서버 실행 확인: `http://192.168.30.240:5000/api/status`
- Raspberry Pi 네트워크 연결 확인
- 센서 하드웨어 연결 확인

### CORS 에러
- Backend의 `CorsConfig.java` 확인
- 허용된 Origin 목록에 프론트엔드 URL 추가

## 📝 개발 로그

자세한 개발 과정 및 학습 내용은 [개발 로그](#-일일-학습-기록) 섹션을 참조하세요.

## 👥 팀 정보

**Team**: dc.kim  
**Project Period**: 2025.10 - 2025.10

## 📄 라이선스

This project is licensed under the MIT License.
