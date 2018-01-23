import random
import math
import time
import pyautogui

from .window import AbstractWindow

DEFAULT_TWEEN = pyautogui.easeInOutCubic

def get_distance(source, target):
    (x1, y1) = source
    (x2, y2) = target
    return math.sqrt(math.pow(x1 - x2, 2) + math.pow(y1 - y2, 2))

def delay():
    time.sleep(random.uniform(0.005, 0.02))

# pylint: disable=too-many-instance-attributes,too-many-locals
class InputController:
    def __init__(self, window: AbstractWindow):
        self.window = window
        self.config = config = window.config

        self.tween = config.get('MouseTween', DEFAULT_TWEEN)
        self.mouse_speed_base = config['MouseSpeedBase']
        self.mouse_speed = config['MouseSpeed']
        self.click_delay = config['MouseClickDelay'] / 1000
        self.click_random_delay = config['MouseClickRandomDelay'] / 1000
        self.duration = self.mouse_speed_base / self.mouse_speed

    def get_position(self, element_rect, window_rect, scale=1.0):
        (x1, y1, w1, h1) = element_rect
        (_x, _y, w2, h2) = window_rect
        (x3, y3, w3, h3) = self.window.get_outer_window_rect()

        # element rect height should be deducted if it overflows from the window
        if y1 + h1 > h2:
            h1 -= y1 + h1 - h2

        inner_x = round(x1 + (w1 / 2)) * scale
        inner_y = round(y1 + (h1 / 2)) * scale

        outer_x = round(x3 + (w3 - w2 - 8))
        outer_y = round(y3 + (h3 - h2 - 8))

        # add deviation
        dev_x = w1 * scale / 4
        dev_y = h1 * scale / 4
        dev_x = round(random.uniform(-dev_x, dev_x))
        dev_y = round(random.uniform(-dev_y, dev_y))

        x = outer_x + inner_x + dev_x
        y = outer_y + inner_y + dev_y

        return (x, y)

    def get_duration(self, target):
        distance = get_distance(pyautogui.position(), target)
        duration = max(self.duration, random.uniform(0, distance / 4000))
        return duration

    def click(self, element_rect=None, window_rect=None, scale=1.0, clicks=1):
        if element_rect is None or window_rect is None:
            pyautogui.click(clicks=clicks)
            return
        (x, y) = self.get_position(element_rect, window_rect, scale)
        pyautogui.click(
            x, y,
            duration=self.get_duration((x, y)),
            tween=self.tween,
            clicks=clicks,
            interval=random.uniform(self.click_delay, self.click_delay + self.click_random_delay)
        )
        delay()

    def move_to(self, element_rect, window_rect, scale=1.0):
        (x, y) = self.get_position(element_rect, window_rect, scale)
        pyautogui.moveTo(
            x, y,
            duration=self.get_duration((x, y)),
            tween=self.tween
        )
        delay()

    def key_press(self, key):
        self.window.key_press(key)
