import time
import win32gui
import win32api
from .abstract_window import AbstractWindow

WINDOW_TITLE_EN = 'Granblue Fantasy'
WINDOW_TITLE_JP = 'グランブルーファンタジー'
WINDOW_TITLE_SUFFIX = ' - Google Chrome'

def get_key_pressed(key_code):
    retval = win32api.GetAsyncKeyState(key_code)
    return retval == 1

class Win32Window(AbstractWindow):
    def setup(self, config):
        self.exit_key_code = int(config['ExitKeyCode'])
        if config['Language'] == 'en':
            self.title = WINDOW_TITLE_EN + WINDOW_TITLE_SUFFIX
        else:
            self.title = WINDOW_TITLE_JP + WINDOW_TITLE_SUFFIX

    def get_handle(self):
        hwnd = win32gui.FindWindowEx(None, None, None, self.title)
        if not hwnd:
            raise RuntimeError("Can't get the window handle!")
        return hwnd

    def get_outer_window_rect(self):
        hwnd = self.get_handle()
        (left, top, right, bottom) = win32gui.GetWindowRect(hwnd)
        return (left, top, right - left, bottom - top)

    def key_press(self, key):
        vk_code = win32api.VkKeyScan(str(key))
        scan_code = win32api.MapVirtualKey(vk_code, 0)
        win32api.keybd_event(vk_code, scan_code, 0, 0)
        win32api.keybd_event(vk_code, scan_code, 2, 0)
        return True

    def escape_listener(self, callback):
        while True:
            if get_key_pressed(self.exit_key_code):
                callback()
                break
            time.sleep(0.5)
