#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
간소화된 환경 모니터링 시스템
라즈베리파이용 최적화 버전
"""

import time
import logging
from datetime import datetime
import json

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/rasberry/chickenFarm/project/project/env_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 하드웨어 가용성 체크
try:
    import RPi.GPIO as GPIO
    import spidev
    import Adafruit_DHT
    HARDWARE_AVAILABLE = True
    logger.info("하드웨어 모듈 로드 성공")
except ImportError as e:
    HARDWARE_AVAILABLE = False
    logger.warning(f"하드웨어 모듈 로드 실패: {e}")

# Flask 관련 import (하드웨어와 무관하게 항상 필요)
try:
    from flask import Flask, jsonify, request
    app = Flask(__name__)
except ImportError as e:
    logger.error(f"Flask import 실패: {e}")
    app = None

# GPIO 핀 설정
LED_PIN = 16
FAN_PIN = 12
SERVO_PIN = 18

# 센서 핀 설정
DHT_PIN = 4
LDR_CHANNEL = 0
NH3_CHANNEL = 1
CO2_CHANNEL = 2
NO2_CHANNEL = 3
CO_CHANNEL = 4

# 현재 설정 (기본값)
current_settings = {
    'ledThreshold': 300,
    'fanThreshold': 70,
    'servoThreshold': 60,
    'autoLedMode': False,
    'manualLedThreshold': 300,
    'locationLat': 37.5665,
    'locationLng': 126.9780,
    'sleepStartHour': 22,
    'sleepEndHour': 6,
    'sleepModeEnabled': True,
    'sleepStartHour': 22,
    'sleepEndHour': 6
}

# 설정 로드 함수
def load_settings_from_backend():
    """스프링 백엔드에서 설정을 가져옴"""
    try:
        import requests
        response = requests.get('http://192.168.30.152:8080/api/env-settings', timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                settings_data = data.get('data', {})
                current_settings.update(settings_data)
                logger.info(f"백엔드에서 설정 로드 성공: {settings_data}")
                return True
            else:
                logger.warning(f"백엔드 응답 실패: {data}")
        else:
            logger.warning(f"백엔드 연결 실패: {response.status_code}")
    except Exception as e:
        logger.error(f"백엔드 설정 로드 실패: {e}")
    
    return False

# 센서 데이터 읽기 함수들
def read_dht22():
    """DHT22 온습도 센서 읽기"""
    if not HARDWARE_AVAILABLE:
        return 25.0, 60.0
    
    try:
        humidity, temperature = Adafruit_DHT.read_retry(Adafruit_DHT.DHT22, DHT_PIN)
        if humidity is not None and temperature is not None:
            return round(temperature, 1), round(humidity, 1)
    except Exception as e:
        logger.error(f"DHT22 읽기 실패: {e}")
    
    return 25.0, 60.0

def read_adc(channel):
    """MCP3008 ADC 읽기"""
    if not HARDWARE_AVAILABLE:
        # 각 가스별로 적정 범위의 기본값 설정
        if channel == NH3_CHANNEL:  # 암모니아
            return 15  # 15ppm 정도
        elif channel == CO2_CHANNEL:  # CO2
            return 400  # 400ppm 정도
        elif channel == NO2_CHANNEL:  # NO2
            return 20   # 20ppb 정도
        elif channel == CO_CHANNEL:  # CO
            return 5    # 5ppm 정도
        else:
            return 300  # 기타 센서
    
    try:
        spi = spidev.SpiDev()
        spi.open(0, 0)
        spi.max_speed_hz = 1000000
        
        adc = spi.xfer2([1, (8 + channel) << 4, 0])
        data = ((adc[1] & 3) << 8) + adc[2]
        spi.close()
        
        return data
    except Exception as e:
        logger.error(f"ADC 채널 {channel} 읽기 실패: {e}")
        # 에러 시에도 적정 기본값 반환
        if channel == NH3_CHANNEL:
            return 15
        elif channel == CO2_CHANNEL:
            return 400
        elif channel == NO2_CHANNEL:
            return 20
        elif channel == CO_CHANNEL:
            return 5
        else:
            return 300

def read_ldr():
    """LDR 조도 센서 읽기"""
    raw_value = read_adc(LDR_CHANNEL)
    # ADC 값을 lux로 변환 (대략적인 공식)
    lux = round((raw_value / 1023.0) * 1000, 1)
    return lux

def read_gas_sensors():
    """가스 센서들 읽기 (ADC 값을 실제 단위로 변환)"""
    # ADC 원시 값 읽기
    nh3_raw = read_adc(NH3_CHANNEL)
    co2_raw = read_adc(CO2_CHANNEL)
    no2_raw = read_adc(NO2_CHANNEL)
    co_raw = read_adc(CO_CHANNEL)
    
    # ADC 값을 실제 단위로 변환
    sensors = {
        'nh3': round((nh3_raw / 1023.0) * 50, 1),    # 0-50 ppm
        'co2': round((co2_raw / 1023.0) * 2000, 1),  # 0-2000 ppm
        'no2': round((no2_raw / 1023.0) * 200, 1),   # 0-200 ppb
        'co': round((co_raw / 1023.0) * 100, 1)      # 0-100 ppm
    }
    return sensors

# 장치 제어 함수들
def control_led(lux_value):
    """LED 제어"""
    if not HARDWARE_AVAILABLE:
        logger.info(f"LED 제어 (시뮬레이션): 조도 {lux_value} lux")
        return
    
    try:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(LED_PIN, GPIO.OUT)
        
        # 수면 모드 체크
        if current_settings.get('sleepModeEnabled', False):
            current_hour = datetime.now().hour
            sleep_start = current_settings.get('sleepStartHour', 22)
            sleep_end = current_settings.get('sleepEndHour', 6)
            
            # 수면 시간 체크 (22시~6시)
            if sleep_start <= current_hour or current_hour < sleep_end:
                GPIO.output(LED_PIN, GPIO.LOW)
                logger.info(f"수면 시간: LED 꺼짐 (현재 시간: {current_hour}시)")
                return
        
        # 조도 기준값으로 LED 제어
        threshold = current_settings.get('manualLedThreshold', 300)
        if lux_value < threshold:
            GPIO.output(LED_PIN, GPIO.HIGH)
            logger.info(f"LED 켜짐: 조도 {lux_value} < {threshold}")
        else:
            GPIO.output(LED_PIN, GPIO.LOW)
            logger.info(f"LED 꺼짐: 조도 {lux_value} >= {threshold}")
            
    except Exception as e:
        logger.error(f"LED 제어 실패: {e}")

def control_fan(temperature):
    """팬 제어"""
    if not HARDWARE_AVAILABLE:
        logger.info(f"팬 제어 (시뮬레이션): 온도 {temperature}°C")
        return
    
    try:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(FAN_PIN, GPIO.OUT)
        
        threshold = current_settings.get('fanThreshold', 70)
        if temperature > threshold:
            GPIO.output(FAN_PIN, GPIO.HIGH)
            logger.info(f"팬 켜짐: 온도 {temperature} > {threshold}")
        else:
            GPIO.output(FAN_PIN, GPIO.LOW)
            logger.info(f"팬 꺼짐: 온도 {temperature} <= {threshold}")
            
    except Exception as e:
        logger.error(f"팬 제어 실패: {e}")

def control_servo(humidity):
    """서보 모터 제어 (창문)"""
    if not HARDWARE_AVAILABLE:
        logger.info(f"서보 제어 (시뮬레이션): 습도 {humidity}%")
        return
    
    try:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(SERVO_PIN, GPIO.OUT)
        
        threshold = current_settings.get('servoThreshold', 60)
        if humidity > threshold:
            # 서보 모터로 창문 열기 (90도)
            pwm = GPIO.PWM(SERVO_PIN, 50)
            pwm.start(7.5)  # 90도
            time.sleep(0.5)
            pwm.stop()
            logger.info(f"창문 열림: 습도 {humidity} > {threshold}")
        else:
            # 서보 모터로 창문 닫기 (0도)
            pwm = GPIO.PWM(SERVO_PIN, 50)
            pwm.start(2.5)  # 0도
            time.sleep(0.5)
            pwm.stop()
            logger.info(f"창문 닫힘: 습도 {humidity} <= {threshold}")
            
    except Exception as e:
        logger.error(f"서보 제어 실패: {e}")

# Flask API 엔드포인트들
if app:
    @app.route('/api/realtime', methods=['GET'])
    def get_realtime_data():
        """실시간 센서 데이터 조회"""
        try:
            # 센서 데이터 읽기
            temperature, humidity = read_dht22()
            lux = read_ldr()
            gas_data = read_gas_sensors()
            
            # 장치 제어
            control_led(lux)
            control_fan(temperature)
            control_servo(humidity)
            
            data = {
                'temperature': temperature,
                'humidity': humidity,
                'lux': lux,
                'nh3': gas_data['nh3'],
                'co2': gas_data['co2'],
                'no2': gas_data['no2'],
                'co': gas_data['co'],
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify({'success': True, 'data': data})
            
        except Exception as e:
            logger.error(f"실시간 데이터 조회 실패: {e}")
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/settings/update', methods=['POST'])
    def update_settings():
        """설정 업데이트"""
        try:
            settings_data = request.get_json()
            logger.info(f"설정 업데이트 요청: {settings_data}")
            
            # 백엔드에 저장 시도
            try:
                import requests
                backend_response = requests.post(
                    'http://192.168.30.152:8080/api/env-settings',
                    json=settings_data,
                    timeout=5
                )
                
                if backend_response.status_code == 200:
                    logger.info("백엔드에 설정 저장 성공")
                    current_settings.update(settings_data)
                    return jsonify({'success': True, 'message': '설정이 저장되었습니다'})
                else:
                    logger.warning(f"백엔드 저장 실패: {backend_response.status_code}")
            except Exception as e:
                logger.warning(f"백엔드 저장 실패: {e}")
            
            # 백엔드 실패 시 로컬만 업데이트
            current_settings.update(settings_data)
            logger.info(f"로컬 설정 업데이트: {settings_data}")
            return jsonify({'success': True, 'message': '로컬 설정이 업데이트되었습니다'})
            
        except Exception as e:
            logger.error(f"설정 업데이트 실패: {e}")
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/settings/apply', methods=['POST'])
    def apply_settings():
        """설정 적용 (백엔드에서 다시 로드)"""
        try:
            success = load_settings_from_backend()
            if success:
                return jsonify({'success': True, 'message': '설정이 적용되었습니다'})
            else:
                return jsonify({'success': False, 'message': '설정 로드에 실패했습니다'})
        except Exception as e:
            logger.error(f"설정 적용 실패: {e}")
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/settings/current', methods=['GET'])
    def get_current_settings():
        """현재 설정 조회"""
        try:
            return jsonify({'success': True, 'data': current_settings})
        except Exception as e:
            logger.error(f"현재 설정 조회 실패: {e}")
            return jsonify({'success': False, 'message': str(e)}), 500


# 메인 실행 함수
def run_flask():
    """Flask 서버 실행"""
    if app:
        logger.info("Flask 서버 시작...")
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        logger.error("Flask 앱이 초기화되지 않았습니다")

def main():
    """메인 함수"""
    logger.info("환경 모니터링 시스템 시작")
    
    # 시작 시 백엔드에서 설정 로드
    load_settings_from_backend()
    
    # Flask 서버 실행
    run_flask()

if __name__ == "__main__":
    main()