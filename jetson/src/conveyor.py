# -*- coding: utf-8 -*-
import time
import threading

import Jetson.GPIO as GPIO

from . import config


class ConveyorController:
    def __init__(
        self,
        in1: int = config.CONVEYOR_IN1,
        in2: int = config.CONVEYOR_IN2,
    ):
        self.in1 = in1
        self.in2 = in2
        self._lock = threading.Lock()
        self._sequence_running = False
        self._shutdown = False

        # GPIO는 gpio.init_gpio()로 이미 BOARD 모드로 설정된 상태
        GPIO.setup(self.in1, GPIO.OUT)
        GPIO.setup(self.in2, GPIO.OUT)

    # ── 기본 제어 ──────────────────────────────────

    def start(self):
        with self._lock:
            if self._shutdown:
                return
            GPIO.output(self.in1, GPIO.LOW)
            GPIO.output(self.in2, GPIO.HIGH)
            print("[INFO][CONVEYOR] started")

    def stop(self):
        with self._lock:
            GPIO.output(self.in1, GPIO.LOW)
            GPIO.output(self.in2, GPIO.LOW)
            print("[INFO][CONVEYOR] stopped")

    # ── 자동 시퀀스 ────────────────────────────────

    def trigger(
        self,
        pre_stop_delay: float = config.CONVEYOR_PRE_STOP_DELAY,
        stop_seconds: float = config.CONVEYOR_STOP_SECONDS,
        cooldown_seconds: float = config.CONVEYOR_TRIGGER_COOLDOWN,
    ) -> bool:
        """감지 이벤트를 받아 정지→재시작→쿨다운 시퀀스를 백그라운드로 실행.
        시퀀스 진행 중 추가 감지는 무시된다. 실제로 트리거됐으면 True 반환."""
        with self._lock:
            if self._shutdown or self._sequence_running:
                return False
            self._sequence_running = True

        t = threading.Thread(
            target=self._sequence_worker,
            args=(pre_stop_delay, stop_seconds, cooldown_seconds),
            daemon=True,
        )
        t.start()
        return True

    def cleanup(self):
        print("[INFO][CONVEYOR] cleanup")
        with self._lock:
            self._shutdown = True
        try:
            GPIO.output(self.in1, GPIO.LOW)
            GPIO.output(self.in2, GPIO.LOW)
        except Exception as e:
            print(f"[WARN][CONVEYOR] cleanup output failed: {e}")

    # ── 내부 ───────────────────────────────────────

    def _sequence_worker(self, pre_stop_delay, stop_seconds, cooldown_seconds):
        print("[INFO][CONVEYOR] detection accepted")
        print(f"[INFO][CONVEYOR] stopping in {pre_stop_delay}s")
        time.sleep(pre_stop_delay)

        if self._is_shutdown():
            self._finish_sequence()
            return

        self.stop()
        print(f"[INFO][CONVEYOR] stopped for {stop_seconds}s")
        time.sleep(stop_seconds)

        if self._is_shutdown():
            self._finish_sequence()
            return

        self.start()
        print(f"[INFO][CONVEYOR] cooldown for {cooldown_seconds}s")
        time.sleep(cooldown_seconds)

        self._finish_sequence()
        print("[INFO][CONVEYOR] detection mode resumed")

    def _is_shutdown(self) -> bool:
        with self._lock:
            return self._shutdown

    def _finish_sequence(self):
        with self._lock:
            self._sequence_running = False
