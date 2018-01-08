import random
import math
import time
import pyautogui
import win32gui

DEFAULT_TWEEN = pyautogui.easeInOutCubic
WINDOW_TITLE_EN = 'Granblue Fantasy'
WINDOW_TITLE_JP = 'グランブルーファンタジー'
WINDOW_TITLE_SUFFIX = ' - Google Chrome'

class Window:
    def __init__(self, config):
        self.config = config
        self.title = (WINDOW_TITLE_EN if config['Language'] == 'en' else WINDOW_TITLE_JP) + WINDOW_TITLE_SUFFIX
        self.tween = config['MouseTween']
        self.duration = config['MouseSpeedBase'] / config['MouseSpeed']
        self.clickDelay = config['MouseClickDelay'] / 1000
        self.clickRandomDelay = config['MouseClickRandomDelay'] / 1000

    def getHandle(self):
        hwnd = win32gui.FindWindowEx(None, None, None, self.title)
        if not hwnd:
            raise ValueError("Can't get the window handle!")
        return hwnd

    def getRect(self):
        hwnd = self.getHandle()
        (left, top, right, bottom) = win32gui.GetWindowRect(hwnd)
        return (left, top, right - left, bottom - top)

    def getPosition(self, elementRect, windowRect, scale=1.0):
        (x1, y1, w1, h1) = elementRect
        (x2, y2, w2, h2) = windowRect
        (x3, y3, w3, h3) = self.getRect()

        # element rect height should be deducted if it overflows from the window
        if y1 + h1 > h2:
            h1 -= y1 + h1 - h2

        innerX = round(x1 + (w1 / 2)) * scale
        innerY = round(y1 + (h1 / 2)) * scale

        outerX = round(x3 + (w3 - w2 - 8))
        outerY = round(y3 + (h3 - h2 - 8))

        # add deviation
        devX = w1 * scale / 4
        devY = h1 * scale / 4
        devX = round(random.uniform(-devX, devX))
        devY = round(random.uniform(-devY, devY))

        x = outerX + innerX + devX
        y = outerY + innerY + devY

        return (x, y)

    def getDistance(self, source, target):
        (x1, y1) = source
        (x2, y2) = target
        return math.sqrt(math.pow(x1 - x2, 2) + math.pow(y1 - y2, 2))

    def getDuration(self, target):
        distance = self.getDistance(pyautogui.position(), target)
        duration = max(self.duration, random.uniform(0, distance / 4000))
        return duration

    def click(self, elementRect=None, windowRect=None, scale=1.0, clicks=1):
        if elementRect is None or windowRect is None:
            pyautogui.click(clicks=clicks)
            return
        (x, y) = self.getPosition(elementRect, windowRect, scale)
        pyautogui.click(
            x, y,
            duration=self.getDuration((x, y)),
            tween=self.tween,
            clicks=clicks,
            interval=random.uniform(self.clickDelay, self.clickDelay + self.clickRandomDelay)
        )
        self.delay()
    
    def moveTo(self, elementRect, windowRect, scale=1.0):
        (x, y) = self.getPosition(elementRect, windowRect, scale)
        pyautogui.moveTo(
            x, y, 
            duration=self.getDuration((x, y)),
            tween=self.tween
        )
        self.delay()

    def delay(self):
        time.sleep(random.uniform(0.005, 0.02))

if __name__ == '__main__':
    window = Window('Granblue Fantasy - Google Chrome')
    print(window.getRect())
