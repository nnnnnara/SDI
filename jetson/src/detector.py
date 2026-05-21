# -*- coding: utf-8 -*-
import os
import sys
import hashlib
import pathlib
import threading
from typing import List, Tuple

# YOLOv5 imports matplotlib while loading. Force a headless backend before that
# import chain starts so Jetson server runs do not pick TkAgg.
os.environ.setdefault("MPLBACKEND", "Agg")

import cv2
import torch
import numpy as np

from . import config

# Detection = (x1, y1, x2, y2, conf, cls_id)
Detection = Tuple[int, int, int, int, float, int]

_inference_lock = threading.Lock()


def load_model(
    weight_path: str = config.WEIGHT_PATH,
    conf_threshold: float = config.CONF_THRESHOLD,
    label: str = "YOLOv5",
):
    if not os.path.isdir(config.YOLOV5_REPO):
        print(f"[ERROR] yolov5 repo not found: {config.YOLOV5_REPO}")
        print("[HINT] git clone -b v6.0 https://github.com/ultralytics/yolov5.git")
        sys.exit(1)

    if not os.path.exists(weight_path):
        print(f"[ERROR] weight file not found: {weight_path}")
        sys.exit(1)

    weight_path = os.path.abspath(weight_path)
    _print_weight_info(label, weight_path)

    pathlib.WindowsPath = pathlib.PosixPath

    _patch_detection_model_alias()
    _patch_yolov5_memory_helpers()

    print(f"[INFO] Loading {label} model: {weight_path}")
    model = torch.hub.load(
        config.YOLOV5_REPO,
        "custom",
        path=weight_path,
        source="local",
        verbose=False,
    )
    model.conf = conf_threshold
    model.iou = config.IOU_THRESHOLD

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[INFO] Using device: {device}")
    model.to(device)
    model.eval()

    print(f"[INFO] {label} model loaded. classes: {model.names}")
    return model


def detect(
    frame: np.ndarray,
    model,
    inference_size: int = config.INFERENCE_SIZE,
) -> List[Detection]:
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    with _inference_lock:
        with torch.no_grad():
            results = model(rgb, size=inference_size)

    raw = results.xyxy[0]
    if raw is None or len(raw) == 0:
        return []

    detections: List[Detection] = []
    for row in raw.cpu().numpy():
        x1, y1, x2, y2, conf, cls_id = row
        detections.append((int(x1), int(y1), int(x2), int(y2), float(conf), int(cls_id)))
    return detections


def draw(frame: np.ndarray, detections: List[Detection], class_names) -> np.ndarray:
    for x1, y1, x2, y2, conf, cls_id in detections:
        label = f"{get_class_name(class_names, cls_id)} {conf:.2f}"
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        text_y = y1 - 10 if y1 - 10 > 10 else y1 + 20
        cv2.putText(frame, label, (x1, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    return frame


def get_class_name(class_names, cls_id: int) -> str:
    if isinstance(class_names, dict):
        return class_names.get(cls_id, str(cls_id))
    if 0 <= cls_id < len(class_names):
        return class_names[cls_id]
    return str(cls_id)


def _print_weight_info(label: str, weight_path: str):
    try:
        stat = os.stat(weight_path)
        print(
            f"[INFO] {label} weight file: path={weight_path} "
            f"size={stat.st_size} sha256={_sha256_short(weight_path)}",
            flush=True,
        )
    except Exception as e:
        print(f"[WARN] failed to inspect {label} weight file {weight_path}: {e}", flush=True)


def _sha256_short(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()[:12]


def _patch_detection_model_alias():
    try:
        repo_abs = os.path.abspath(config.YOLOV5_REPO)
        if repo_abs not in sys.path:
            sys.path.insert(0, repo_abs)

        import models.yolo as yolo_module

        if not hasattr(yolo_module, "DetectionModel") and hasattr(yolo_module, "Model"):
            yolo_module.DetectionModel = yolo_module.Model
            print("[INFO] Patched YOLOv5: DetectionModel = Model")
    except Exception as e:
        print(f"[WARN] DetectionModel alias patch skipped: {e}")


def _patch_yolov5_memory_helpers():
    try:
        repo_abs = os.path.abspath(config.YOLOV5_REPO)
        if repo_abs not in sys.path:
            sys.path.insert(0, repo_abs)

        import utils.torch_utils as torch_utils

        # Jetson Nano can fail to fork subprocesses while loading the second
        # model. YOLOv5 only uses git_describe() for a banner string, so avoid
        # the subprocess-backed helper.
        torch_utils.git_describe = lambda path=repo_abs: "local"
    except Exception as e:
        print(f"[WARN] YOLOv5 memory helper patch skipped: {e}")
