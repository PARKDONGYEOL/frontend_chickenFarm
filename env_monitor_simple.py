"""양계장 환경 센서 실시간 모니터링 시스템 (간소화 버전)"""
import logging
import math
import time
import threading
from datetime import datetime
from typing import Optional, Tuple, Dict, Any

# 하드웨어 관련 (필요시에만 import)
try:
    import board
    import adafruit_dht
    import spidev
    import RPi.GPIO as GPIO
    import mysql.connector
    HARDWARE_AVAILABLE = True
except ImportError as e:
    logging.warning(f"하드웨어 라이브러리 일부를 사용할 수 없습니다: {e}")
    HARDWARE_AVAILABLE = False

# Flask는 항상 import (하드웨어 없어도 API 서버는 실행)
try:
    import requests
    from flask import Flask, jsonify
    from flask_cors import CORS
except ImportError as e:
    logging.error(f"Flask 라이브러리를 사용할 수 없습니다: {e}")
    exit(1)

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Flask 서버
app = Flask(__name__)
CORS(app)

# 전역 변수
latest_sensor_data = {
    'temperature': 25, 'humidity': 60, 'lux': 500, 'co2': 400, 
    'co': 0, 'nh3': 0, 'no2': 0, 'timestamp': None, 'is_warming': False
}

# 현재 설정 (간단한 딕셔너리)
current_settings = {
    'autoLedMode': False,
    'manualLedThreshold': 700,
    'sleepModeEnabled': True,
    'sleepStartHour': 22,
    'sleepEndHour': 6
}

# 설정 로드 함수
def load_settings_from_backend():
    """스프링 백엔드에서 설정을 가져옴"""
    try:
        import requests
        response = requests.get('http://localhost:8080/api/env-settings', timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                current_settings.update(data['data'])
                logger.info(f"백엔드에서 설정 로드 완료: {current_settings}")
                return True
    except Exception as e:
        logger.warning(f"백엔드에서 설정 로드 실패: {e}")
    return False

# Flask API 엔드포인트
@app.route('/api/realtime')
def get_realtime():
    return jsonify({'success': True, 'data': latest_sensor_data})

@app.route('/api/status')
def get_status():
    return jsonify({
        'success': True,
        'message': '라즈베리파이 센서 시스템 작동 중',
        'timestamp': latest_sensor_data.get('timestamp')
    })

@app.route('/api/settings/update', methods=['POST'])
def update_settings():
    """설정 업데이트 - 백엔드에 먼저 저장"""
    try:
        settings_data = request.get_json()
        if settings_data:
            logger.info(f"설정 업데이트 요청 받음: {settings_data}")
            
            # 먼저 백엔드에 저장 시도
            try:
                import requests
                backend_response = requests.post(
                    'http://localhost:8080/api/env-settings', 
                    json=settings_data, 
                    timeout=5
                )
                if backend_response.status_code == 200:
                    logger.info("백엔드에 설정 저장 성공")
                    # 백엔드 저장 성공 시 로컬 설정도 업데이트
                    current_settings.update(settings_data)
                    logger.info(f"로컬 설정 업데이트: {current_settings}")
                else:
                    logger.warning(f"백엔드 저장 실패: {backend_response.status_code}")
                    # 백엔드 실패 시 로컬에만 저장
                    current_settings.update(settings_data)
                    logger.info(f"로컬 설정 업데이트 (백엔드 실패): {current_settings}")
            except Exception as backend_error:
                logger.warning(f"백엔드 연결 실패, 로컬에만 저장: {backend_error}")
                current_settings.update(settings_data)
            
            logger.info(f"설정 업데이트 완료: {current_settings}")
            logger.info(f"현재 LED 설정 - autoLedMode: {current_settings.get('autoLedMode')}, manualLedThreshold: {current_settings.get('manualLedThreshold')}")
            
            # LED 제어 즉시 테스트
            if 'manualLedThreshold' in settings_data:
                test_lux = 500  # 테스트용 조도값
                led_status = SimpleDeviceController().control_led(test_lux)
                logger.info(f"LED 제어 테스트 (조도 {test_lux}): {led_status}")
            
            return jsonify({
                'success': True, 
                'message': '설정 업데이트 완료',
                'data': current_settings
            })
        return jsonify({'success': False, 'message': '설정 데이터 없음'}), 400
    except Exception as e:
        logger.error(f"설정 업데이트 실패: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/settings/current', methods=['GET'])
def get_current_settings():
    """현재 설정 조회"""
    return jsonify({'success': True, 'data': current_settings})

@app.route('/api/settings/apply', methods=['POST'])
def apply_settings():
    """설정 적용"""
    return jsonify({'success': True, 'message': '설정 적용 완료'})

# 간단한 센서 읽기 클래스
class SimpleSensorReader:
    def __init__(self):
        if HARDWARE_AVAILABLE:
            try:
                self.spi = spidev.SpiDev()
                self.spi.open(0, 0)
                self.spi.max_speed_hz = 1000000
                self.dht_sensor = adafruit_dht.DHT22(board.D17)
            except:
                self.spi = None
                self.dht_sensor = None
        else:
            self.spi = None
            self.dht_sensor = None
    
    def read_adc(self, channel):
        if not self.spi:
            return 512
        if channel > 7 or channel < 0:
            return -1
        r = self.spi.xfer2([1, (8 + channel) << 4, 0])
        return ((r[1] & 3) << 8) + r[2]
    
    def read_dht_sensor(self):
        if not self.dht_sensor:
            return 25.0, 60.0
        try:
            humidity = self.dht_sensor.humidity
            temperature = self.dht_sensor.temperature
            if humidity is not None and temperature is not None:
                return temperature, humidity
        except:
            pass
        return 25.0, 60.0
    
    def read_all_sensors(self):
        temperature, humidity = self.read_dht_sensor()
        ldr_adc = self.read_adc(0)
        mq_adc = self.read_adc(1)
        
        lux = (ldr_adc / 1024.0) * 1000 if ldr_adc > 0 else 0
        
        return {
            'temperature': temperature,
            'humidity': humidity,
            'lux': lux,
            'co2': 400 + (mq_adc / 10),
            'co': mq_adc / 20,
            'nh3': mq_adc / 15,
            'no2': mq_adc / 12,
            'timestamp': time.time()
        }

# 간단한 장치 제어 클래스
class SimpleDeviceController:
    def __init__(self):
        if HARDWARE_AVAILABLE:
            try:
                GPIO.setmode(GPIO.BCM)
                self.LED_PIN = 16
                GPIO.setup(self.LED_PIN, GPIO.OUT)
            except:
                self.LED_PIN = None
        else:
            self.LED_PIN = None
    
    def control_led(self, lux):
        if not self.LED_PIN:
            return "OFF (하드웨어 없음)"
        
        # 수면 시간 확인
        now = datetime.now()
        sleep_start = current_settings.get('sleepStartHour', 22)
        sleep_end = current_settings.get('sleepEndHour', 6)
        sleep_enabled = current_settings.get('sleepModeEnabled', True)
        
        if sleep_enabled:
            if sleep_start > sleep_end:  # 밤 10시 ~ 새벽 6시
                if now.hour >= sleep_start or now.hour < sleep_end:
                    GPIO.output(self.LED_PIN, GPIO.LOW)
                    logger.info(f"수면 시간으로 LED 강제 끔: 조도 {lux:.0f} lux")
                    return "OFF (수면시간)"
            else:  # 낮 시간 수면
                if sleep_start <= now.hour < sleep_end:
                    GPIO.output(self.LED_PIN, GPIO.LOW)
                    logger.info(f"수면 시간으로 LED 강제 끔: 조도 {lux:.0f} lux")
                    return "OFF (수면시간)"
        
        # LED 제어
        auto_mode = current_settings.get('autoLedMode', False)
        if auto_mode:
            threshold = 300  # 자동 모드 기본값
            mode_text = "자동"
        else:
            threshold = current_settings.get('manualLedThreshold', 700)
            mode_text = "수동"
        
        logger.info(f"LED 제어 ({mode_text}): 현재 조도={lux:.0f}, 기준값={threshold}")
        
        if lux <= threshold:
            GPIO.output(self.LED_PIN, GPIO.HIGH)
            logger.info(f"LED 켜짐: 조도 {lux:.0f} <= 기준값 {threshold}")
            return f"ON (조도: {lux:.0f} <= {threshold})"
        else:
            GPIO.output(self.LED_PIN, GPIO.LOW)
            logger.info(f"LED 꺼짐: 조도 {lux:.0f} > 기준값 {threshold}")
            return f"OFF (조도: {lux:.0f} > {threshold})"

# 메인 시스템
class SimpleEnvMonitorSystem:
    def __init__(self):
        self.sensor_reader = SimpleSensorReader()
        self.device_controller = SimpleDeviceController()
        self.is_running = False
    
    def run(self):
        self.is_running = True
        logger.info("간소화된 환경 모니터링 시스템 시작")
        
        # 시작 시 백엔드에서 설정 로드
        if load_settings_from_backend():
            logger.info("백엔드에서 설정을 성공적으로 로드했습니다.")
        else:
            logger.info("백엔드 연결 실패, 기본 설정을 사용합니다.")
        
        while self.is_running:
            try:
                # 센서 데이터 읽기
                sensor_data = self.sensor_reader.read_all_sensors()
                
                # 전역 변수 업데이트
                global latest_sensor_data
                latest_sensor_data.update(sensor_data)
                
                # LED 제어
                led_status = self.device_controller.control_led(sensor_data['lux'])
                
                # 간단한 로그
                logger.info(f"온도: {sensor_data['temperature']:.1f}°C, "
                          f"습도: {sensor_data['humidity']:.1f}%, "
                          f"조도: {sensor_data['lux']:.0f}lux, "
                          f"LED: {led_status}")
                
                time.sleep(5)
                
            except KeyboardInterrupt:
                logger.info("사용자에 의해 중단됨")
                break
            except Exception as e:
                logger.error(f"실행 중 오류: {e}")
                time.sleep(10)
    
    def cleanup(self):
        self.is_running = False
        if HARDWARE_AVAILABLE:
            GPIO.cleanup()

# Flask 서버 실행 함수
def run_flask():
    if HARDWARE_AVAILABLE:
        app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
    else:
        logger.warning("하드웨어가 사용 불가능하여 Flask 서버를 시작하지 않습니다.")

# 메인 실행
if __name__ == "__main__":
    try:
        # Flask 서버를 별도 쓰레드에서 실행
        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()
        
        # 메인 모니터링 시스템 실행
        system = SimpleEnvMonitorSystem()
        system.run()
        
    except KeyboardInterrupt:
        logger.info("프로그램 종료")
    finally:
        if HARDWARE_AVAILABLE:
            GPIO.cleanup()
