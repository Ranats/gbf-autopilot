from abc import ABC, abstractmethod

class WindowHandler(ABC):
    def __init__(self, title):
        self.title = title

    @abstractmethod
    def getRect(self):
        pass
