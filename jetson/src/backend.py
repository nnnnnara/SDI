# -*- coding: utf-8 -*-
import base64
import json
import secrets
from datetime import datetime
from urllib import request, error

import cv2

from . import config


def post_inspection(run_id, raw_frame, result_frame, result, confidence, defects):
    if run_id is None:
        print("[ERROR][BACKEND] runId is None; result POST skipped", flush=True)
        return False

    if not config.BACKEND_RESULT_URL:
        print("[WARN][BACKEND] BACKEND_RESULT_URL is empty; result POST skipped", flush=True)
        return False

    payload = _build_payload(run_id, raw_frame, result_frame, result, confidence, defects)
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        config.BACKEND_RESULT_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=config.BACKEND_POST_TIMEOUT_SECONDS) as res:
            body = res.read().decode("utf-8", errors="replace")
            print(
                f"[INFO][BACKEND] POST ok status={res.status} serialNo={payload['serialNo']} body={body[:200]}",
                flush=True,
            )
            return 200 <= res.status < 300
    except error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"[ERROR][BACKEND] POST failed status={e.code} body={body[:500]}", flush=True)
    except Exception as e:
        print(f"[ERROR][BACKEND] POST exception: {e}", flush=True)
    return False


def _build_payload(run_id, raw_frame, result_frame, result, confidence, defects):
    return {
        "runId": run_id,
        "serialNo": _generate_serial_no(),
        "result": result,
        "confidence": confidence,
        "rawImageBase64": _to_b64(raw_frame),
        "resultImageBase64": _to_b64(result_frame),
        "defects": _format_defects(defects),
        "inspectedAt": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
    }


def _generate_serial_no():
    ts = datetime.now().strftime("%y%m%d%H%M%S")
    suffix = secrets.token_hex(2).upper()
    return f"BAT-{ts}-{suffix}"


def _format_defects(defects):
    formatted = []
    for defect in defects:
        item = _format_defect(defect)
        if item is not None:
            formatted.append(item)
    return formatted


def _format_defect(defect):
    defect_type = defect.get("defectType") or defect.get("className") or str(defect.get("classId", "UNKNOWN"))
    defect_type = str(defect_type).strip().upper().replace("-", "_").replace(" ", "_")
    defect_type = config.DEFECT_TYPE_ALIASES.get(defect_type, defect_type)
    if defect_type not in config.BACKEND_DEFECT_TYPES:
        return None

    return {
        "defectType": defect_type,
        "confidence": defect.get("confidence", 0.0),
    }


def _to_b64(frame):
    ok, buf = cv2.imencode(".jpg", frame)
    if not ok:
        raise RuntimeError("failed to encode frame as jpg")
    return "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode()
