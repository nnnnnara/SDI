# -*- coding: utf-8 -*-
import traceback

import gi
gi.require_version("Gst", "1.0")
from gi.repository import Gst

import numpy as np

from . import config

# GStreamer는 프로세스당 한 번만 초기화
Gst.init(None)


def build_csi_pipeline(
    sensor_id: int,
    capture_width: int = config.CSI_CAPTURE_WIDTH,
    capture_height: int = config.CSI_CAPTURE_HEIGHT,
    display_width: int = config.CSI_DISPLAY_WIDTH,
    display_height: int = config.CSI_DISPLAY_HEIGHT,
    framerate: int = config.CSI_FRAMERATE,
    flip_method: int = config.CSI_FLIP_METHOD,
) -> str:
    return (
        f"nvarguscamerasrc sensor-id={sensor_id} sensor-mode={config.CSI_SENSOR_MODE} ! "
        f"video/x-raw(memory:NVMM), "
        f"width=(int){capture_width}, height=(int){capture_height}, "
        f"format=(string)NV12, framerate=(fraction){framerate}/1 ! "
        f"nvvidconv flip-method={flip_method} ! "
        f"video/x-raw, width=(int){display_width}, height=(int){display_height}, "
        f"format=(string)BGRx ! "
        f"videoconvert ! "
        f"video/x-raw, format=(string)BGR ! "
        f"appsink name=sink drop=true max-buffers=1 sync=false"
    )


class GstCamera:
    def __init__(self, pipeline_str: str, name: str = "CSI"):
        self.name = name
        self._pipeline_str = pipeline_str
        self._pipeline = None
        self._sink = None
        self._bus = None
        self._read_fail_count = 0
        self._first_frame_logged = False

        print(f"[INFO][{self.name}] Creating GStreamer pipeline...")
        print(f"[INFO][{self.name}] pipeline: {self._pipeline_str}")

        self._pipeline = Gst.parse_launch(self._pipeline_str)

        self._sink = self._pipeline.get_by_name("sink")
        if self._sink is None:
            raise RuntimeError("appsink named 'sink' not found in pipeline")

        self._sink.set_property("emit-signals", False)
        self._sink.set_property("sync", False)
        self._sink.set_property("drop", True)
        self._sink.set_property("max-buffers", 1)

        self._bus = self._pipeline.get_bus()

        print(f"[INFO][{self.name}] Setting pipeline to PLAYING...")
        ret = self._pipeline.set_state(Gst.State.PLAYING)
        print(f"[DEBUG][{self.name}] set_state: {ret.value_nick}")

        ret, state, pending = self._pipeline.get_state(5 * Gst.SECOND)
        print(f"[DEBUG][{self.name}] get_state: {ret.value_nick}, state={state.value_nick}, pending={pending.value_nick}")

        self._drain_bus()

        if ret == Gst.StateChangeReturn.FAILURE:
            self.release()
            raise RuntimeError(f"[{self.name}] GStreamer pipeline failed to reach PLAYING state")

        print(f"[INFO][{self.name}] camera ready")

    def read(self, timeout_sec: float = 2.0):
        """(success: bool, frame: np.ndarray | None) 반환."""
        try:
            sample = self._sink.emit("try-pull-sample", int(timeout_sec * Gst.SECOND))

            if sample is None:
                self._read_fail_count += 1
                if self._read_fail_count % config.READ_FAIL_LOG_EVERY == 1:
                    print(
                        f"[WARN][{self.name}] no frame within {timeout_sec}s "
                        f"(fail_count={self._read_fail_count})"
                    )
                    self._drain_bus()
                return False, None

            self._read_fail_count = 0

            buf = sample.get_buffer()
            caps = sample.get_caps()
            structure = caps.get_structure(0)
            width = structure.get_value("width")
            height = structure.get_value("height")

            ok, map_info = buf.map(Gst.MapFlags.READ)
            if not ok:
                print(f"[ERROR][{self.name}] Gst buffer map failed")
                self._drain_bus()
                return False, None

            try:
                frame = np.ndarray(
                    shape=(height, width, 3),
                    dtype=np.uint8,
                    buffer=map_info.data,
                ).copy()
            finally:
                buf.unmap(map_info)

            if not self._first_frame_logged:
                self._first_frame_logged = True
                fmt = structure.get_value("format")
                print(f"[INFO][{self.name}] first frame: {frame.shape}, caps={width}x{height} {fmt}")

            return True, frame

        except Exception as e:
            print(f"[ERROR][{self.name}] read() exception: {e}")
            traceback.print_exc()
            self._drain_bus()
            return False, None

    def release(self):
        print(f"[INFO][{self.name}] releasing...")
        if self._pipeline is not None:
            self._pipeline.set_state(Gst.State.NULL)
        print(f"[INFO][{self.name}] released")

    def _drain_bus(self):
        if self._bus is None:
            return
        while True:
            msg = self._bus.pop()
            if msg is None:
                break
            if msg.type == Gst.MessageType.ERROR:
                err, dbg = msg.parse_error()
                print(f"[GSTREAMER ERROR][{self.name}] {err}")
                print(f"[GSTREAMER DEBUG][{self.name}] {dbg}")
            elif msg.type == Gst.MessageType.WARNING:
                warn, dbg = msg.parse_warning()
                print(f"[GSTREAMER WARNING][{self.name}] {warn}")
                print(f"[GSTREAMER DEBUG][{self.name}] {dbg}")
            elif msg.type == Gst.MessageType.EOS:
                print(f"[GSTREAMER EOS][{self.name}]")
            elif msg.type == Gst.MessageType.STATE_CHANGED:
                if msg.src == self._pipeline:
                    old, new, pending = msg.parse_state_changed()
                    print(
                        f"[GSTREAMER STATE][{self.name}] "
                        f"{old.value_nick} -> {new.value_nick} (pending={pending.value_nick})"
                    )
