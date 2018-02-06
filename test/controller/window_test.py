import random

from controller.stubs import CONFIG, ELEMENT_RECT, WINDOW_RECT
from controller.window import DummyWindow
from controller import InputController


class WindowTest:
    def __init__(self):
        self.controller = InputController(DummyWindow(CONFIG))

    def setup(self):
        random.seed(0)

    def test_position(self):
        (x, y) = self.controller.get_position(ELEMENT_RECT, WINDOW_RECT)
        (ex, ey, ew, eh) = ELEMENT_RECT
        (wx, wy, _w, _h) = WINDOW_RECT

        assert (wx + ex) <= x <= (wx + ex + ew)
        assert (wy + ey) <= y <= (wy + ey + eh)
