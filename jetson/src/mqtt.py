# -*- coding: utf-8 -*-
import json
import base64
import secrets
from datetime import datetime

import cv2
import paho.mqtt.client as mqtt

from . import config

_client = None


def _on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"[INFO][MQTT] connected to {config.MQTT_HOST}:{config.MQTT_PORT}", flush=True)
    else:
        print(f"[WARN][MQTT] connect failed rc={rc}", flush=True)


def _on_disconnect(client, userdata, rc):
    if rc != 0:
        print(f"[WARN][MQTT] unexpected disconnect rc={rc}, will reconnect", flush=True)


def init():
    global _client
    _client = mqtt.Client()
    _client.on_connect = _on_connect
    _client.on_disconnect = _on_disconnect
    _client.reconnect_delay_set(min_delay=1, max_delay=30)
    _client.loop_start()
    try:
        _client.connect_async(config.MQTT_HOST, config.MQTT_PORT, keepalive=60)
    except Exception as e:
        print(f"[WARN][MQTT] connect_async failed: {e}", flush=True)


def cleanup():
    global _client
    if _client is not None:
        _client.loop_stop()
        _client.disconnect()
        print("[INFO][MQTT] disconnected", flush=True)


def publish_inspection(run_id, raw_frame, result_frame, result, confidence, defects):
    if _client is None:
        return

    serial_no = _generate_serial_no()

    def _to_b64(frame):
        _, buf = cv2.imencode(".jpg", frame)
        return "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode()

    payload = {
        "runId": run_id,
        "serialNo": serial_no,
        "result": result,
        "confidence": confidence,
        "rawImageBase64": _to_b64(raw_frame),
        "resultImageBase64": _to_b64(result_frame),
        "defects": defects,
        "inspectedAt": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
    }

    _client.publish(config.MQTT_TOPIC, json.dumps(payload))
    print(f"[INFO][MQTT] published serialNo={serial_no} runId={run_id}", flush=True)


def _generate_serial_no():
    ts = datetime.now().strftime("%y%m%d%H%M%S")
    suffix = secrets.token_hex(2).upper()
    return f"BAT-{ts}-{suffix}"
