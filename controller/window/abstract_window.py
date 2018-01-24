from threading import Thread
from abc import ABC, abstractmethod

class AbstractWindow(ABC):
    def __init__(self, config):
        self.config = config
        self.setup(config)

    def setup(self, config):
        pass

    @abstractmethod
    def get_outer_window_rect(self):
        pass

    @abstractmethod
    def key_press(self, key):
        pass

    @abstractmethod
    def escape_listener(self, callback):
        pass

    def listen_for_escape(self, callback):
        t = Thread(target=self.escape_listener, args=(callback,))
        t.setDaemon(True)
        t.start()
