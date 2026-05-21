# -*- coding: utf-8 -*-
from . import config


class ServoSorter:
    def __init__(self):
        # Jetson 40-pin wiring for PCA9685: 1=3.3V, 3=SDA, 5=SCL, 39=GND.
        from board import SCL, SDA
        import busio
        from adafruit_motor import servo
        from adafruit_pca9685 import PCA9685

        self.i2c = busio.I2C(SCL, SDA)
        self.pca = PCA9685(self.i2c, address=config.SERVO_I2C_ADDRESS)
        self.pca.frequency = 50
        self.servo0 = servo.Servo(
            self.pca.channels[config.SERVO_CHANNEL],
            min_pulse=config.SERVO_MIN_PULSE,
            max_pulse=config.SERVO_MAX_PULSE,
        )

        self.servo0.angle = config.SERVO_HOME_ANGLE
        print(f"[INFO][SERVO] initialized angle={config.SERVO_HOME_ANGLE}", flush=True)

    def sort(self, result: str) -> bool:
        normalized = result.strip().upper()
        if normalized == "GOOD":
            angle = config.SERVO_GOOD_ANGLE
        elif normalized == "BAD":
            angle = config.SERVO_BAD_ANGLE
        else:
            print(f"[WARN][SERVO] unknown result ignored: {result}", flush=True)
            return False

        self.servo0.angle = angle
        print(f"[INFO][SERVO] result={normalized} angle={angle}", flush=True)
        return True

    def cleanup(self):
        try:
            self.servo0.angle = config.SERVO_HOME_ANGLE
            print(f"[INFO][SERVO] cleanup angle={config.SERVO_HOME_ANGLE}", flush=True)
        except Exception as e:
            print(f"[WARN][SERVO] cleanup angle failed: {e}", flush=True)

        try:
            self.pca.deinit()
        except Exception as e:
            print(f"[WARN][SERVO] PCA9685 deinit failed: {e}", flush=True)
