# -*- coding: utf-8 -*-
import os
import time
import traceback
from datetime import datetime

import cv2
from flask import Flask, Response, request, jsonify

from . import backend
from . import config

app = Flask(__name__)

_model = None
_secondary_model = None
_conveyor = None
_cam1 = None
_cam2 = None
_mqtt = None
_servo_sorter = None
_current_run_id = None
_secondary_names_logged = False


def init(model, secondary_model, conveyor, cam1, cam2, mqtt_client=None, servo_sorter=None):
    global _model, _secondary_model, _conveyor, _cam1, _cam2, _mqtt, _servo_sorter
    _model = model
    _secondary_model = secondary_model
    _conveyor = conveyor
    _cam1 = cam1
    _cam2 = cam2
    _mqtt = mqtt_client
    _servo_sorter = servo_sorter


@app.route("/")
def root():
    conveyor_status = "enabled" if config.ENABLE_CONVEYOR else "disabled"
    servo_status = "enabled" if _servo_sorter is not None else "disabled"
    return f"""<!DOCTYPE html>
<html>
<head>
  <title>Dual CSI YOLOv5n Stream</title>
  <style>
    body {{ font-family: sans-serif; background: #111; color: #eee; padding: 24px; }}
    a {{ color: #7cc7ff; display: block; margin: 12px 0; font-size: 20px; }}
  </style>
</head>
<body>
  <h2>Dual CSI YOLOv5n Stream</h2>
  <p>CSI camera 1: sensor-id {config.CSI1_SENSOR_ID}</p>
  <p>CSI camera 2: sensor-id {config.CSI2_SENSOR_ID}</p>
  <p>Primary YOLO weight: {config.WEIGHT_PATH}</p>
  <p>Secondary YOLO weight: {config.SECONDARY_WEIGHT_PATH}</p>
  <p>Target class id: {config.TARGET_CLASS_ID}</p>
  <p>LED pin: BOARD {config.LED_PIN}</p>
  <p>Conveyor: {conveyor_status}</p>
  <p>Servo sorter: {servo_status}</p>
  <p>Logic: detect cell, trigger conveyor, run secondary inspection, publish result</p>
  <a href="/camera-view-1/">CSI Ribbon Camera 1</a>
  <a href="/camera-view-2/">CSI Ribbon Camera 2</a>
</body>
</html>"""


@app.route("/camera-view-1/")
def camera_view_1():
    return _camera_page("CSI Ribbon Camera 1 YOLOv5n Stream", "/camera-view-1/video_feed")


@app.route("/camera-view-1/video_feed")
def camera_feed_1():
    if _cam1 is None:
        return "Camera 1 not initialized", 503
    return Response(
        _stream(_cam1, "CSI-1"),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


@app.route("/camera-view-2/")
def camera_view_2():
    return _camera_page("CSI Ribbon Camera 2 YOLOv5n Stream", "/camera-view-2/video_feed")


@app.route("/camera-view-2/video_feed")
def camera_feed_2():
    if _cam2 is None:
        return "Camera 2 not initialized", 503
    return Response(
        _stream(_cam2, "CSI-2"),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


@app.route("/api/process/start", methods=["POST"])
def process_start():
    global _current_run_id

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "invalid JSON"}), 400

    run_id = data.get("runId", data.get("run_id"))
    command_type = data.get("commandType")

    if run_id is None or command_type not in ("START", "STOP"):
        return jsonify({"error": "runId and commandType(START|STOP) required"}), 400

    _current_run_id = run_id
    print(f"[INFO][API] runId={run_id} commandType={command_type}", flush=True)

    if _conveyor is None:
        return jsonify({"error": "conveyor not available"}), 503

    if command_type == "START":
        _conveyor.start()
    else:
        _conveyor.stop()

    return jsonify({"runId": _current_run_id, "commandType": command_type}), 200


@app.route("/health")
def health():
    return "OK\n"


@app.route("/api/servo/sort", methods=["POST"])
@app.route("/jetson/api/servo/sort", methods=["POST"])
def servo_sort():
    print(f"[INFO][SERVO][API] request path={request.path}", flush=True)
    data = request.get_json(silent=True) or {}
    result = str(data.get("result", "")).strip().upper()
    if result not in ("GOOD", "BAD"):
        return jsonify({"error": "result must be GOOD or BAD"}), 400
    servo_sorter = _get_servo_sorter()
    if servo_sorter is None:
        print("[WARN][SERVO][API] servo sorter not available", flush=True)
        return jsonify({"error": "servo sorter not available"}), 503

    try:
        print(f"[INFO][SERVO][API] sorting result={result}", flush=True)
        triggered = servo_sorter.sort(result)
    except Exception as e:
        print(f"[ERROR][SERVO][API] sort failed: {e}", flush=True)
        return jsonify({"error": str(e)}), 500

    print(f"[INFO][SERVO][API] done result={result} triggered={triggered}", flush=True)
    return jsonify({"result": result, "triggered": triggered}), 200


def _camera_page(title: str, stream_url: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
  <title>{title}</title>
  <style>
    html, body {{ margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }}
    img {{ display: block; width: 100vw; height: 100vh; object-fit: cover; }}
  </style>
</head>
<body>
  <img src="{stream_url}" alt="camera stream">
</body>
</html>"""


def _inspect_and_save_both_cameras(triggered_camera_name):
    from . import detector
    global _secondary_names_logged

    if not _secondary_names_logged:
        print(f"[INFO][INSPECTION] secondary model classes: {_secondary_model.names}", flush=True)
        _secondary_names_logged = True

    os.makedirs("images", exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    frames = _read_stopped_frames(triggered_camera_name)
    if not frames:
        print("[ERROR][INSPECTION] no stopped camera frames captured", flush=True)
        return

    print(f"[INFO][INSPECTION] captured stopped frames: {sorted(frames.keys())}", flush=True)

    all_defects = []
    detected_defect_count = 0
    detected_defect_confidences = []
    raw_frames_for_post = []
    result_frames_for_post = []

    for cam_name, raw_frame in frames.items():
        raw_path = os.path.join("images", f"{ts}_{cam_name}_raw.jpg")
        cv2.imwrite(raw_path, raw_frame)
        print(f"[INFO] saved {raw_path}", flush=True)

        detections = detector.detect(
            raw_frame,
            _secondary_model,
            inference_size=config.SECONDARY_INFERENCE_SIZE,
        )
        detected_classes = [
            detector.get_class_name(_secondary_model.names, cls_id)
            for _, _, _, _, _, cls_id in detections
        ]
        print(
            f"[INFO][INSPECTION] camera={cam_name} "
            f"raw_detections={len(detections)} classes={detected_classes}",
            flush=True,
        )
        result_frame = detector.draw(raw_frame.copy(), detections, _secondary_model.names)

        result_path = os.path.join("images", f"{ts}_{cam_name}_result.jpg")
        cv2.imwrite(result_path, result_frame)
        print(f"[INFO] saved {result_path}", flush=True)

        raw_frames_for_post.append((cam_name, raw_frame))
        result_frames_for_post.append((cam_name, result_frame))

        for x1, y1, x2, y2, conf, cls_id in detections:
            class_name = detector.get_class_name(_secondary_model.names, cls_id)
            if not _is_good_class(class_name):
                detected_defect_count += 1
                detected_defect_confidences.append(float(conf))

            defect_type = _to_backend_defect_type(class_name)
            if defect_type is None:
                print(
                    f"[WARN][INSPECTION] ignored non-backend defect class "
                    f"camera={cam_name} classId={cls_id} className={class_name} confidence={conf:.4f}",
                    flush=True,
                )
                continue

            all_defects.append(
                {
                    "camera": cam_name,
                    "classId": cls_id,
                    "defectType": defect_type,
                    "className": class_name,
                    "confidence": round(conf, 4),
                    "bbox": [x1, y1, x2, y2],
                }
            )

    result = _inspection_result_from_detected_defects(detected_defect_count)
    confidence = round(max(detected_defect_confidences, default=1.0), 4)
    print(
        f"[INFO][INSPECTION] secondary result={result} "
        f"detected_defects={detected_defect_count} backend_defects={len(all_defects)}",
        flush=True,
    )
    _sort_by_result(result)

    if _current_run_id is None:
        print(
            "[ERROR][INSPECTION] runId is not set; result POST skipped. "
            "Call /api/process/start with {'runId': ..., 'commandType': 'START'} before inspection.",
            flush=True,
        )
        return

    raw_frame_for_post = _compose_camera_grid(raw_frames_for_post)
    result_frame_for_post = _compose_camera_grid(result_frames_for_post)

    combined_raw_path = os.path.join("images", f"{ts}_combined_raw.jpg")
    combined_result_path = os.path.join("images", f"{ts}_combined_result.jpg")
    cv2.imwrite(combined_raw_path, raw_frame_for_post)
    cv2.imwrite(combined_result_path, result_frame_for_post)
    print(f"[INFO] saved {combined_raw_path}", flush=True)
    print(f"[INFO] saved {combined_result_path}", flush=True)

    if _mqtt is not None:
        _mqtt.publish_inspection(
            _current_run_id,
            raw_frame_for_post,
            result_frame_for_post,
            result,
            confidence,
            all_defects,
        )

    backend.post_inspection(
        _current_run_id,
        raw_frame_for_post,
        result_frame_for_post,
        result,
        confidence,
        all_defects,
    )


def _sort_by_result(result):
    servo_sorter = _get_servo_sorter()
    if servo_sorter is None:
        print(f"[WARN][SERVO] sorter unavailable; result={result}", flush=True)
        return
    try:
        expected_angle = _servo_angle_for_result(result)
        print(
            f"[INFO][SERVO] inspection result={result} expected_angle={expected_angle}",
            flush=True,
        )
        triggered = servo_sorter.sort(result)
        if not triggered:
            print(f"[WARN][SERVO] sort skipped result={result}", flush=True)
    except Exception as e:
        print(f"[ERROR][SERVO] sort failed result={result}: {e}", flush=True)


def _get_servo_sorter():
    return _servo_sorter


def _inspection_result_from_detected_defects(detected_defect_count: int) -> str:
    return "BAD" if detected_defect_count > 0 else "GOOD"


def _servo_angle_for_result(result: str):
    normalized = result.strip().upper()
    if normalized == "GOOD":
        return config.SERVO_GOOD_ANGLE
    if normalized == "BAD":
        return config.SERVO_BAD_ANGLE
    return None


def _compose_camera_grid(named_frames):
    if not named_frames:
        raise RuntimeError("no frames to compose")
    if len(named_frames) == 1:
        name, frame = named_frames[0]
        return _draw_camera_name(frame.copy(), name)

    target_height = min(frame.shape[0] for _, frame in named_frames)
    composed = []
    for name, frame in named_frames:
        resized = _resize_to_height(frame, target_height)
        composed.append(_draw_camera_name(resized, name))

    return cv2.hconcat(composed)


def _resize_to_height(frame, target_height):
    height, width = frame.shape[:2]
    if height == target_height:
        return frame.copy()
    target_width = max(1, int(width * (target_height / float(height))))
    return cv2.resize(frame, (target_width, target_height))


def _draw_camera_name(frame, name):
    cv2.rectangle(frame, (0, 0), (120, 34), (0, 0, 0), -1)
    cv2.putText(
        frame,
        name,
        (10, 24),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 255, 255),
        2,
    )
    return frame


def _read_stopped_frames(triggered_camera_name):
    wait_seconds = config.CONVEYOR_PRE_STOP_DELAY + config.INSPECTION_CAPTURE_SETTLE_SECONDS
    print(f"[INFO][INSPECTION] waiting {wait_seconds:.2f}s for conveyor stop before capture", flush=True)
    time.sleep(wait_seconds)

    frames = {}
    cameras = [
        (triggered_camera_name, _cam1 if triggered_camera_name == "CSI-1" else _cam2),
    ]
    other_name, other_cam = ("CSI-2", _cam2) if triggered_camera_name == "CSI-1" else ("CSI-1", _cam1)
    cameras.append((other_name, other_cam))

    for cam_name, cam in cameras:
        if cam is None:
            continue
        ret, frame = cam.read(timeout_sec=1)
        if ret:
            frames[cam_name] = frame
        else:
            print(f"[WARN][INSPECTION] stopped frame read failed: {cam_name}", flush=True)

    return frames


def _is_good_class(class_name: str) -> bool:
    normalized = class_name.strip().lower()
    return normalized in ("good", "ok", "normal", "pass", "cell")


def _to_backend_defect_type(class_name: str):
    if _is_good_class(class_name):
        return None

    normalized = class_name.strip().upper().replace("-", "_").replace(" ", "_")
    defect_type = config.DEFECT_TYPE_ALIASES.get(normalized, normalized)
    if defect_type in config.BACKEND_DEFECT_TYPES:
        return defect_type
    return None


def _stream(camera, camera_name: str):
    from . import detector

    frame_index = 0
    fps_count = 0
    last_time = time.time()
    fps = 0.0
    consecutive_failures = 0

    print(f"[INFO][{camera_name}] client connected")

    try:
        while True:
            ret, frame = camera.read(timeout_sec=2)

            if not ret:
                consecutive_failures += 1
                if consecutive_failures % config.READ_FAIL_LOG_EVERY == 1:
                    print(
                        f"[WARN][{camera_name}] frame read failed "
                        f"(consecutive={consecutive_failures})"
                    )
                time.sleep(0.05)
                continue

            consecutive_failures = 0
            frame_index += 1
            fps_count += 1

            if frame_index % config.DETECT_EVERY_N_FRAMES == 0:
                try:
                    detections = detector.detect(frame, _model)
                    frame = detector.draw(frame, detections, _model.names)

                    class_ids = [d[5] for d in detections]
                    if config.TARGET_CLASS_ID in class_ids:
                        print(f"[INFO][{camera_name}] cell detected, conveyor trigger")
                        triggered = _conveyor.trigger() if _conveyor is not None else True
                        if triggered:
                            _inspect_and_save_both_cameras(camera_name)
                except Exception as e:
                    print(f"[ERROR][{camera_name}] detection failed: {e}")
                    traceback.print_exc()

            now = time.time()
            elapsed = now - last_time
            if elapsed >= 1.0:
                fps = fps_count / elapsed
                fps_count = 0
                last_time = now

            cv2.putText(
                frame,
                f"{camera_name} FPS: {fps:.1f}",
                (10, 25),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 255),
                2,
            )

            ok, buffer = cv2.imencode(".jpg", frame)
            if not ok:
                print(f"[WARN][{camera_name}] jpg encode failed")
                continue

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n"
                + buffer.tobytes()
                + b"\r\n"
            )

    except GeneratorExit:
        print(f"[INFO][{camera_name}] client disconnected")
    except Exception as e:
        print(f"[ERROR][{camera_name}] stream exception: {e}")
        traceback.print_exc()
