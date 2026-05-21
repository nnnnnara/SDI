# -*- coding: utf-8 -*-
# Dual CSI Ribbon Camera + YOLOv5n + Flask MJPEG Streaming
#
# Camera 1:  http://<host>:8001/camera-view-1/
# Camera 2:  http://<host>:8001/camera-view-2/
#
# 동작 순서:
#   1. GPIO 초기화, LED ON
#   2. YOLOv5 모델 로드
#   3. 컨베이어 벨트 시작
#   4. CSI 카메라 2대 오픈
#   5. Flask MJPEG 스트리밍 서버 시작
#   6. 객체 감지(class 0 = cell) 시 컨베이어 정지→재시작→쿨다운
#   7. 종료(Ctrl+C 또는 예외) 시 카메라·컨베이어·LED·GPIO 정리

import traceback
import os

import Jetson.GPIO as GPIO

from src import config
from src.gpio import init_gpio, LEDController
from src.conveyor import ConveyorController
from src.servo_sorter import ServoSorter
from src.camera import GstCamera, build_csi_pipeline
from src import detector
from src import server

try:
    from src import mqtt
except Exception as e:
    mqtt = None
    print(f"[WARN][MQTT] disabled: {e}")


def main():
    led = None
    conveyor = None
    servo_sorter = None
    cam1 = None
    cam2 = None

    try:
        print("[INFO] Program start")

        if config.ENABLE_SERVO_SORTER:
            try:
                servo_sorter = ServoSorter()
                # Adafruit board/busio may touch Jetson.GPIO mode while opening I2C.
                # Clear that state before the conveyor/LED pins use BOARD mode.
                GPIO.cleanup()
            except Exception as e:
                print(f"[WARN][SERVO] disabled: {e}")
                traceback.print_exc()
        else:
            print("[INFO][SERVO] disabled")

        # GPIO는 여기서 한 번만 초기화
        init_gpio()

        led = LEDController()
        led.on()

        _validate_model_paths()

        primary_model = detector.load_model(
            config.WEIGHT_PATH,
            config.CONF_THRESHOLD,
            label="primary cell detector",
        )
        secondary_model = detector.load_model(
            config.SECONDARY_WEIGHT_PATH,
            config.SECONDARY_CONF_THRESHOLD,
            label="secondary defect detector",
        )

        if config.ENABLE_CONVEYOR:
            conveyor = ConveyorController()
        else:
            print("[INFO][CONVEYOR] disabled")

        cam1 = GstCamera(build_csi_pipeline(config.CSI1_SENSOR_ID), name="CSI-1")
        cam2 = GstCamera(build_csi_pipeline(config.CSI2_SENSOR_ID), name="CSI-2")

        if mqtt is not None:
            mqtt.init()

        server.init(primary_model, secondary_model, conveyor, cam1, cam2, mqtt, servo_sorter)

        _print_startup_info()

        server.app.run(host="0.0.0.0", port=config.PORT, debug=False, threaded=True)

    except KeyboardInterrupt:
        print("\n[INFO] Ctrl+C pressed")

    except Exception as e:
        print(f"[ERROR] Exception in main: {e}")
        traceback.print_exc()

    finally:
        if cam1 is not None:
            cam1.release()
        if cam2 is not None:
            cam2.release()
        if conveyor is not None:
            conveyor.cleanup()
        if servo_sorter is not None:
            servo_sorter.cleanup()
        if mqtt is not None:
            mqtt.cleanup()
        if led is not None:
            led.off()
        GPIO.cleanup()
        print("[INFO] shutdown complete")


def _print_startup_info():
    print(f"[INFO] Flask listening on 0.0.0.0:{config.PORT}")
    print(f"[INFO] CSI-1 sensor-id: {config.CSI1_SENSOR_ID}")
    print(f"[INFO] CSI-2 sensor-id: {config.CSI2_SENSOR_ID}")
    print(f"[INFO] YOLO weight: {config.WEIGHT_PATH}")
    print(f"[INFO] Secondary YOLO weight: {config.SECONDARY_WEIGHT_PATH}")
    print(f"[INFO] Backend result POST URL: {config.BACKEND_RESULT_URL or '(disabled)'}")
    print(f"[INFO] Target class id: {config.TARGET_CLASS_ID}")
    print(f"[INFO] Inference size: {config.INFERENCE_SIZE}")
    print(f"[INFO] Detect every N frames: {config.DETECT_EVERY_N_FRAMES}")
    print(f"[INFO] ENABLE_CONVEYOR: {config.ENABLE_CONVEYOR}")
    print(f"[INFO] ENABLE_SERVO_SORTER: {config.ENABLE_SERVO_SORTER}")
    print(
        f"[INFO] Servo sorter: GOOD={config.SERVO_GOOD_ANGLE} "
        f"BAD={config.SERVO_BAD_ANGLE} HOME={config.SERVO_HOME_ANGLE}"
    )
    print(
        f"[INFO] Conveyor logic: detect → wait {config.CONVEYOR_PRE_STOP_DELAY}s "
        f"→ stop {config.CONVEYOR_STOP_SECONDS}s → restart → cooldown {config.CONVEYOR_TRIGGER_COOLDOWN}s"
    )


def _validate_model_paths():
    primary = os.path.abspath(config.WEIGHT_PATH)
    secondary = os.path.abspath(config.SECONDARY_WEIGHT_PATH)
    print(f"[INFO] Primary model path: {primary}")
    print(f"[INFO] Secondary model path: {secondary}")
    if primary == secondary:
        print("[ERROR] Primary and secondary model paths are the same")


if __name__ == "__main__":
    main()
