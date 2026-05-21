# -*- coding: utf-8 -*-
import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# ── 서버 ──────────────────────────────────────────
PORT = 8001

# ── YOLO ──────────────────────────────────────────
YOLOV5_REPO = os.path.join(BASE_DIR, "yolov5")
WEIGHT_PATH = os.path.join(BASE_DIR, "best.pt")
SECONDARY_WEIGHT_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "yolo-server", "best.pt"))
CONF_THRESHOLD = 0.35
SECONDARY_CONF_THRESHOLD = 0.35
IOU_THRESHOLD = 0.45
INFERENCE_SIZE = 320
SECONDARY_INFERENCE_SIZE = 320
DETECT_EVERY_N_FRAMES = 5
TARGET_CLASS_ID = 0  # class 0 = "cell"
BACKEND_DEFECT_TYPES = {"SCRATCH", "LEAK", "MISASSEMBLY", "MISPRINT", "DENT"}
DEFECT_TYPE_ALIASES = {
    "SCRATCH": "SCRATCH",
    "LEAK": "LEAK",
    "MISASSEMBLY": "MISASSEMBLY",
    "MISPRINT": "MISPRINT",
    "DENT": "DENT",
}

# ── 컨베이어 ──────────────────────────────────────
ENABLE_CONVEYOR = True
CONVEYOR_IN1 = 31           # BOARD 물리 핀 번호
CONVEYOR_IN2 = 29
INSPECTION_CAPTURE_SETTLE_SECONDS = 0.3
CONVEYOR_PRE_STOP_DELAY = 0.3   # 인식 후 정지까지 대기(초)
CONVEYOR_STOP_SECONDS = 5.0     # 정지 유지(초)
CONVEYOR_TRIGGER_COOLDOWN = 5.0 # 재시작 후 재감지 무시(초)

# ── LED ───────────────────────────────────────────
LED_PIN = 7  # BOARD 물리 핀 번호

# ── CSI 카메라 ────────────────────────────────────
CSI1_SENSOR_ID = 0
CSI2_SENSOR_ID = 1
CSI_SENSOR_MODE = 4
CSI_CAPTURE_WIDTH = 1280
CSI_CAPTURE_HEIGHT = 720
CSI_DISPLAY_WIDTH = 640
CSI_DISPLAY_HEIGHT = 360
CSI_FRAMERATE = 15
CSI_FLIP_METHOD = 0

# ── MQTT ──────────────────────────────────────────
MQTT_HOST = "k14a306.p.ssafy.io"
MQTT_PORT = 1883
MQTT_TOPIC = "factory/inspection"

# Backend result POST. Override with BACKEND_RESULT_URL in the Jetson environment if needed.
BACKEND_RESULT_URL = os.environ.get(
    "BACKEND_RESULT_URL",
    "https://k14a306.p.ssafy.io/api/device/inspections",
)
BACKEND_POST_TIMEOUT_SECONDS = 10

# ── 로그 ──────────────────────────────────────────
ENABLE_SERVO_SORTER = True
SERVO_I2C_ADDRESS = 0x60
SERVO_CHANNEL = 0
SERVO_MIN_PULSE = 500
SERVO_MAX_PULSE = 2500
SERVO_HOME_ANGLE = 0
SERVO_GOOD_ANGLE = 0
SERVO_BAD_ANGLE = 50
SERVO_HOLD_SECONDS = 1.0
SERVO_RETURN_HOME = False

READ_FAIL_LOG_EVERY = 10
