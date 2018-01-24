import sys
import os
from .abstract_window import AbstractWindow
from .dummy_window import DummyWindow

if sys.platform == 'win32':
    from .win32_window import Win32Window as Window
else:
    if os.environ['GBF_AUTOPILOT_USE_DUMMY_WINDOW']:
        Window = DummyWindow
    else:
        raise OSError("Platform '%s' is not supported!" % sys.platform)
