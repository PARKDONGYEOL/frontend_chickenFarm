# 파이썬 코드 수정 사항

# 1. 설정 업데이트 API 수정
@app.route('/api/settings/update', methods=['POST'])
def update_settings():
    """설정을 직접 업데이트하고 데이터베이스에 저장"""
    try:
        settings_data = request.get_json()
        if not settings_data:
            return jsonify({
                'success': False,
                'message': '설정 데이터가 없습니다.'
            }), 400
        
        # 전역 변수로 설정 관리자에 접근
        global system_instance
        if system_instance and hasattr(system_instance, 'settings_manager'):
            # 1. 메모리에 설정 업데이트
            for key, value in settings_data.items():
                if hasattr(system_instance.settings_manager, 'settings'):
                    system_instance.settings_manager.settings[key] = value
            
            # 2. 🔥 핵심: 데이터베이스에 설정 저장
            success = save_settings_to_db(settings_data)
            
            if success:
                logger.info(f"설정이 메모리와 DB에 모두 업데이트됨: {settings_data}")
                return jsonify({
                    'success': True,
                    'message': '설정이 성공적으로 업데이트되었습니다.',
                    'data': settings_data
                })
            else:
                return jsonify({
                    'success': False,
                    'message': '데이터베이스 저장에 실패했습니다.'
                }), 500
        else:
            return jsonify({
                'success': False,
                'message': '시스템 인스턴스를 찾을 수 없습니다.'
            }), 500
    except Exception as e:
        logger.error(f"설정 업데이트 실패: {e}")
        return jsonify({
            'success': False,
            'message': f'설정 업데이트 실패: {str(e)}'
        }), 500

# 2. 데이터베이스 저장 함수 추가
def save_settings_to_db(settings_data):
    """설정을 데이터베이스에 저장"""
    try:
        global system_instance
        if not system_instance or not hasattr(system_instance, 'db_manager'):
            return False
        
        with system_instance.db_manager.get_connection() as conn:
            if not conn:
                return False
            
            cursor = conn.cursor()
            
            # 설정을 데이터베이스에 저장
            for key, value in settings_data.items():
                # 설정 키를 DB 컬럼명으로 매핑
                column_mapping = {
                    'ledThreshold': 'LED_THRESHOLD',
                    'doorOpenTemp': 'DOOR_OPEN_TEMP',
                    'doorCloseTemp': 'DOOR_CLOSE_TEMP',
                    'fanHumidityThreshold': 'FAN_HUMIDITY_THRESHOLD',
                    'fanCO2Threshold': 'FAN_CO2_THRESHOLD',
                    'fanCOThreshold': 'FAN_CO_THRESHOLD',
                    'fanSpeed': 'FAN_SPEED',
                    'tempHighAlert': 'TEMP_HIGH_ALERT',
                    'tempLowAlert': 'TEMP_LOW_ALERT',
                    'humidityHighAlert': 'HUMIDITY_HIGH_ALERT',
                    'humidityLowAlert': 'HUMIDITY_LOW_ALERT',
                    'co2Alert': 'CO2_ALERT',
                    'coAlert': 'CO_ALERT',
                    'nh3Alert': 'NH3_ALERT',
                    'envStatusGood': 'ENV_STATUS_GOOD',
                    'envStatusFair': 'ENV_STATUS_FAIR',
                    'autoLedMode': 'AUTO_LED_MODE',
                    'manualLedThreshold': 'MANUAL_LED_THRESHOLD',
                    'locationLat': 'LOCATION_LAT',
                    'locationLng': 'LOCATION_LNG',
                    'sleepStartHour': 'SLEEP_START_HOUR',
                    'sleepEndHour': 'SLEEP_END_HOUR',
                    'sleepModeEnabled': 'SLEEP_MODE_ENABLED',
                    'servoThreshold': 'SERVO_THRESHOLD',
                    'useSimpleSensorMode': 'USE_SIMPLE_SENSOR_MODE'
                }
                
                if key in column_mapping:
                    db_column = column_mapping[key]
                    sql = f"UPDATE ENV_SETTINGS SET {db_column} = %s WHERE ID = 1"
                    cursor.execute(sql, (value,))
                    logger.info(f"DB 업데이트: {db_column} = {value}")
            
            conn.commit()
            cursor.close()
            return True
            
    except Exception as e:
        logger.error(f"데이터베이스 저장 실패: {e}")
        return False

# 3. 설정 적용 API 수정
@app.route('/api/settings/apply', methods=['POST'])
def apply_settings():
    """설정 적용 요청 처리"""
    try:
        global system_instance
        if system_instance and hasattr(system_instance, 'settings_manager'):
            # 설정을 데이터베이스에서 다시 로드하여 최신 상태로 동기화
            success = system_instance.settings_manager.load_settings_from_db()
            if success:
                logger.info("설정이 데이터베이스에서 로드되어 적용되었습니다.")
                return jsonify({
                    'success': True,
                    'message': '설정이 성공적으로 적용되었습니다.'
                })
            else:
                return jsonify({
                    'success': False,
                    'message': '설정 로드에 실패했습니다.'
                })
        else:
            return jsonify({
                'success': False,
                'message': '시스템 인스턴스를 찾을 수 없습니다.'
            })
    except Exception as e:
        logger.error(f"설정 적용 실패: {e}")
        return jsonify({
            'success': False,
            'message': f'설정 적용 실패: {str(e)}'
        }), 500
