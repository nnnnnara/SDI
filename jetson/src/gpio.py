# -*- coding: utf-8 -*-
import Jetson.GPIO as GPIO
from . import config


def init_gpio():
    """GPIO를 BOARD 모드로 초기화. 프로그램 시작 시 한 번만 호출."""
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BOARD)


class LEDController:
    def __init__(self, pin: int = config.LED_PIN):
        self.pin = pin
        GPIO.setup(pin, GPIO.OUT)

    def on(self):
        GPIO.output(self.pin, GPIO.HIGH)
        print(f"[INFO][LED{self.pin}] ON")

    def off(self):
        try:
            GPIO.output(self.pin, GPIO.LOW)
            print(f"[INFO][LED{self.pin}] OFF")
        except Exception as e:
            print(f"[WARN][LED{self.pin}] OFF failed: {e}")
