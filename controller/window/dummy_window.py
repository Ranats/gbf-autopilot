from .abstract_window import AbstractWindow

class DummyWindow(AbstractWindow):
    def get_outer_window_rect(self):
        return (0, 0, 800, 600)

    def key_press(self, key):
        return True

    def escape_listener(self, callback):
        # do nothing
        pass
