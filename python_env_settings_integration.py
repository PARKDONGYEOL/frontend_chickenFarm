# 환경 설정 관리 클래스 추가
class EnvSettingsManager:
    """환경 설정 관리"""
    
    def __init__(self, db_manager, farm_num=1):
        self.db_manager = db_manager
        self.farm_num = farm_num
        self.settings = self.load_default_settings()
        self.last_update = None
    
    def load_default_settings(self):
        """기본 설정값 로드"""
        return {
            'ledThreshold': 300,
            'doorOpenTemp': 25,
            'doorCloseTemp': 15,
            'fanHumidityThreshold': 75,
            'fanCO2Threshold': 1000,
            'fanCOThreshold': 30,
            'fanSpeed': 60,
            'tempHighAlert': 35,
            'tempLowAlert': 10,
            'humidityHighAlert': 85,
            'humidityLowAlert': 30,
            'co2Alert': 2000,
            'coAlert': 50,
            'nh3Alert': 25,
            'envStatusGood': 80,
            'envStatusFair': 60
        }
    
    def load_settings_from_db(self):
        """데이터베이스에서 설정 로드"""
        with self.db_manager.get_connection() as conn:
            if not conn:
                return False
            
            try:
                cursor = conn.cursor()
                sql = "SELECT * FROM ENV_SETTINGS WHERE ID = 1"
                cursor.execute(sql)
                result = cursor.fetchone()
                
                if result:
                    # 데이터베이스 컬럼명을 설정 키로 매핑
                    column_mapping = {
                        'LED_THRESHOLD': 'ledThreshold',
                        'DOOR_OPEN_TEMP': 'doorOpenTemp',
                        'DOOR_CLOSE_TEMP': 'doorCloseTemp',
                        'FAN_HUMIDITY_THRESHOLD': 'fanHumidityThreshold',
                        'FAN_CO2_THRESHOLD': 'fanCO2Threshold',
                        'FAN_CO_THRESHOLD': 'fanCOThreshold',
                        'FAN_SPEED': 'fanSpeed',
                        'TEMP_HIGH_ALERT': 'tempHighAlert',
                        'TEMP_LOW_ALERT': 'tempLowAlert',
                        'HUMIDITY_HIGH_ALERT': 'humidityHighAlert',
                        'HUMIDITY_LOW_ALERT': 'humidityLowAlert',
                        'CO2_ALERT': 'co2Alert',
                        'CO_ALERT': 'coAlert',
                        'NH3_ALERT': 'nh3Alert',
                        'ENV_STATUS_GOOD': 'envStatusGood',
                        'ENV_STATUS_FAIR': 'envStatusFair'
                    }
                    
                    # 결과를 딕셔너리로 변환
                    columns = [desc[0] for desc in cursor.description]
                    row_dict = dict(zip(columns, result))
                    
                    # 설정 업데이트
                    for db_col, setting_key in column_mapping.items():
                        if db_col in row_dict and row_dict[db_col] is not None:
                            self.settings[setting_key] = float(row_dict[db_col])
                    
                    self.last_update = datetime.now()
                    logger.info("환경 설정이 데이터베이스에서 로드되었습니다.")
                    return True
                else:
                    logger.warning("데이터베이스에서 환경 설정을 찾을 수 없습니다. 기본값을 사용합니다.")
                    return False
                    
            except mysql.connector.Error as err:
                logger.error(f'환경 설정 로드 오류: {err}')
                return False
            finally:
                cursor.close()
    
    def get_setting(self, key, default=None):
        """설정값 조회"""
        return self.settings.get(key, default)
    
    def update_setting(self, key, value):
        """설정값 업데이트"""
        self.settings[key] = value
    
    def should_reload_settings(self):
        """설정을 다시 로드해야 하는지 확인 (5분마다)"""
        if self.last_update is None:
            return True
        
        time_diff = datetime.now() - self.last_update
        return time_diff.total_seconds() > 300  # 5분


# 기존 EnvConfig 클래스를 수정하여 동적 설정 지원
class DynamicEnvConfig(EnvConfig):
    """동적 환경 설정"""
    
    def __init__(self, settings_manager):
        super().__init__()
        self.settings_manager = settings_manager
    
    def get_led_threshold(self):
        return self.settings_manager.get_setting('ledThreshold', 300)
    
    def get_door_open_temp(self):
        return self.settings_manager.get_setting('doorOpenTemp', 25)
    
    def get_door_close_temp(self):
        return self.settings_manager.get_setting('doorCloseTemp', 15)
    
    def get_fan_humidity_threshold(self):
        return self.settings_manager.get_setting('fanHumidityThreshold', 75)
    
    def get_fan_co2_threshold(self):
        return self.settings_manager.get_setting('fanCO2Threshold', 1000)
    
    def get_fan_co_threshold(self):
        return self.settings_manager.get_setting('fanCOThreshold', 30)
    
    def get_fan_speed(self):
        return self.settings_manager.get_setting('fanSpeed', 60)
    
    def get_temp_high_alert(self):
        return self.settings_manager.get_setting('tempHighAlert', 35)
    
    def get_temp_low_alert(self):
        return self.settings_manager.get_setting('tempLowAlert', 10)
    
    def get_humidity_high_alert(self):
        return self.settings_manager.get_setting('humidityHighAlert', 85)
    
    def get_humidity_low_alert(self):
        return self.settings_manager.get_setting('humidityLowAlert', 30)
    
    def get_co2_alert(self):
        return self.settings_manager.get_setting('co2Alert', 2000)
    
    def get_co_alert(self):
        return self.settings_manager.get_setting('coAlert', 50)
    
    def get_nh3_alert(self):
        return self.settings_manager.get_setting('nh3Alert', 25)


# DeviceController 클래스 수정
class DynamicDeviceController(DeviceController):
    """동적 설정을 지원하는 장치 제어"""
    
    def __init__(self, config, settings_manager):
        super().__init__(config)
        self.settings_manager = settings_manager
    
    def control_led(self, lux):
        threshold = self.settings_manager.get_setting('ledThreshold', 300)
        if lux <= threshold:
            GPIO.output(self.config.LED_PIN, GPIO.HIGH)
            return "ON"
        else:
            GPIO.output(self.config.LED_PIN, GPIO.LOW)
            return "OFF"
    
    def control_door(self, temp):
        open_temp = self.settings_manager.get_setting('doorOpenTemp', 25)
        close_temp = self.settings_manager.get_setting('doorCloseTemp', 15)
        
        if temp >= open_temp and self.servo_position != 180:
            self.set_servo_angle(180)
            logger.info(f"문 열림 (온도: {temp:.1f}°C, 기준: {open_temp}°C)")
        elif temp <= close_temp and self.servo_position != 0:
            self.set_servo_angle(0)
            logger.info(f"문 닫힘 (온도: {temp:.1f}°C, 기준: {close_temp}°C)")
    
    def control_fan(self, sensor_data):
        fan_needed = False
        reasons = []
        
        humidity_threshold = self.settings_manager.get_setting('fanHumidityThreshold', 75)
        co2_threshold = self.settings_manager.get_setting('fanCO2Threshold', 1000)
        co_threshold = self.settings_manager.get_setting('fanCOThreshold', 30)
        fan_speed = self.settings_manager.get_setting('fanSpeed', 60)
        
        if sensor_data.get('humidity', 0) >= humidity_threshold:
            fan_needed = True
            reasons.append(f"고습도 ({sensor_data['humidity']:.1f}% >= {humidity_threshold}%)")
        
        if sensor_data.get('co2', 0) > co2_threshold:
            fan_needed = True
            reasons.append(f"CO2 농도 높음 ({sensor_data['co2']:.1f}ppm > {co2_threshold}ppm)")
        
        if sensor_data.get('co', 0) > co_threshold:
            fan_needed = True
            reasons.append(f"CO 농도 높음 ({sensor_data['co']:.3f}ppm > {co_threshold}ppm)")
        
        if fan_needed:
            self.pwm_a.ChangeDutyCycle(fan_speed)
            return True, ", ".join(reasons)
        else:
            self.pwm_a.ChangeDutyCycle(0)
            return False, ""


# EnvMonitorSystem 클래스 수정
class DynamicEnvMonitorSystem(EnvMonitorSystem):
    """동적 설정을 지원하는 환경 모니터링 시스템"""
    
    def __init__(self):
        super().__init__()
        
        # 설정 관리자 초기화
        self.settings_manager = EnvSettingsManager(self.db_manager, self.config.FARM_NUM)
        
        # 동적 설정 로드
        self.settings_manager.load_settings_from_db()
        
        # 동적 설정을 사용하는 컨트롤러로 교체
        self.device_controller = DynamicDeviceController(self.config, self.settings_manager)
    
    def check_dangers(self, sensor_data):
        """동적 설정을 사용한 위험 알림 체크"""
        temp = sensor_data.get('temperature')
        if temp:
            temp_high_alert = self.settings_manager.get_setting('tempHighAlert', 35)
            temp_low_alert = self.settings_manager.get_setting('tempLowAlert', 10)
            
            if temp >= temp_high_alert:
                self.db_manager.save_danger_notice(
                    f'🌡️ 온도가 {temp:.1f}°C로 너무 높습니다.', 
                    '온도', self.config.FARM_NUM)
            elif temp <= temp_low_alert:
                self.db_manager.save_danger_notice(
                    f'🌡️ 온도가 {temp:.1f}°C로 너무 낮습니다.', 
                    '온도', self.config.FARM_NUM)
        
        hum = sensor_data.get('humidity')
        if hum:
            humidity_high_alert = self.settings_manager.get_setting('humidityHighAlert', 85)
            humidity_low_alert = self.settings_manager.get_setting('humidityLowAlert', 30)
            
            if hum >= humidity_high_alert:
                self.db_manager.save_danger_notice(
                    f'💧 습도가 {hum:.1f}%로 너무 높습니다.', 
                    '습도', self.config.FARM_NUM)
            elif hum <= humidity_low_alert:
                self.db_manager.save_danger_notice(
                    f'💧 습도가 {hum:.1f}%로 너무 낮습니다.', 
                    '습도', self.config.FARM_NUM)
        
        co2_alert = self.settings_manager.get_setting('co2Alert', 2000)
        if sensor_data.get('co2', 0) > co2_alert:
            self.db_manager.save_danger_notice(
                f'⚠️ CO2 농도가 {sensor_data["co2"]:.1f}ppm으로 너무 높습니다.', 
                'CO2', self.config.FARM_NUM)
        
        co_alert = self.settings_manager.get_setting('coAlert', 50)
        if sensor_data.get('co', 0) > co_alert:
            self.db_manager.save_danger_notice(
                f'⚠️ CO 농도가 {sensor_data["co"]:.3f}ppm으로 위험합니다.', 
                'CO', self.config.FARM_NUM)
        
        nh3_alert = self.settings_manager.get_setting('nh3Alert', 25)
        if sensor_data.get('nh3', 0) > nh3_alert:
            self.db_manager.save_danger_notice(
                f'⚠️ 암모니아 농도가 {sensor_data["nh3"]:.3f}ppm으로 높습니다.', 
                'NH3', self.config.FARM_NUM)
    
    def control_devices(self, sensor_data):
        """동적 설정을 사용한 장치 제어"""
        led_status = self.device_controller.control_led(sensor_data['lux'])
        
        temp = sensor_data.get('temperature')
        if temp is not None:
            self.device_controller.control_door(temp)
        
        fan_active, fan_reason = self.device_controller.control_fan(sensor_data)
        if fan_active:
            logger.info(f"팬 가동: {fan_reason}")
        
        return led_status, fan_active
    
    def run(self):
        """메인 실행 루프 (설정 자동 리로드 포함)"""
        logger.info("="*60)
        logger.info("동적 환경 모니터링 시스템 시작")
        logger.info("="*60)
        
        # 예열 여부 선택
        need_warmup = self.warmup_manager.ask_warmup()
        
        if need_warmup:
            self.warmup_manager.start_warmup()
        
        loop_count = 0
        
        try:
            while True:
                # 설정 자동 리로드 (5분마다)
                if self.settings_manager.should_reload_settings():
                    self.settings_manager.load_settings_from_db()
                
                sensor_data = self.read_sensors()
                
                if sensor_data is None:
                    time.sleep(2)
                    continue
                
                # 전역 변수 업데이트
                global latest_sensor_data
                latest_sensor_data = {
                    'temperature': round(sensor_data['temperature'], 1),
                    'humidity': round(sensor_data['humidity'], 1),
                    'lux': sensor_data['lux'],
                    'co2': round(sensor_data['co2'], 1),
                    'no2': round(sensor_data['no2'], 3),
                    'co': round(sensor_data['co'], 3),
                    'nh3': round(sensor_data['nh3'], 3),
                    'timestamp': datetime.now().isoformat(),
                    'is_warming': self.warmup_manager.is_warming
                }
                
                # 예열 중인지 확인
                if self.warmup_manager.is_warming:
                    self.warmup_manager.print_progress(sensor_data)
                    
                    _, _, is_complete = self.warmup_manager.get_progress()
                    if is_complete:
                        self.warmup_manager.complete_warmup()
                    
                    time.sleep(1)
                    continue
                
                # 정상 모니터링 모드
                self.check_dangers(sensor_data)
                self.control_devices(sensor_data)
                
                if loop_count % 2 == 0:
                    self.print_status(sensor_data)
                
                # 5분마다 DB 저장
                if loop_count % 300 == 0 and loop_count > 0:
                    db_data = {
                        'temperature': round(sensor_data['temperature'], 1),
                        'humidity': round(sensor_data['humidity'], 1),
                        'lux': sensor_data['lux'],
                        'no2': round(sensor_data['no2'], 3),
                        'co': round(sensor_data['co'], 3),
                        'co2': round(sensor_data['co2'], 1),
                        'nh3': round(sensor_data['nh3'], 3)
                    }
                    self.db_manager.save_farm_status(db_data, self.config.FARM_NUM)
                    loop_count = 0
                
                time.sleep(1)
                loop_count += 1
        
        except KeyboardInterrupt:
            logger.info("\n시스템 종료")
        
        finally:
            self.device_controller.cleanup()
            self.sensor_reader.spi.close()
            logger.info("정리 완료")


# Flask API 엔드포인트 추가
@app.route('/api/settings/apply', methods=['POST'])
def apply_settings():
    """설정 적용 요청 처리"""
    try:
        # 여기서 실제로는 시스템에 설정 적용 신호를 보내거나
        # 설정 파일을 업데이트하는 등의 작업을 수행
        return jsonify({
            'success': True,
            'message': '설정이 성공적으로 적용되었습니다.'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'설정 적용 실패: {str(e)}'
        }), 500


# main 함수 수정
def main():
    try:
        # Flask 서버를 별도 쓰레드로 시작
        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()
        logger.info("Flask 서버 시작 (포트 5000)")
        
        # 동적 환경 모니터링 시스템 시작
        system = DynamicEnvMonitorSystem()
        system.run()
        
    except Exception as e:
        logger.error(f"시스템 오류: {e}", exc_info=True)
        raise
    finally:
        GPIO.cleanup()
