def element_rect(json):
    return (json['x'], json['y'], json['width'], json['height'])

def window_rect(json):
    return (0, 0, json['window']['width'], json['window']['height'])

class JSONRPCMethods:
    def __init__(self, window):
        self.command_started = False
        self.window = window

    def start(self):
        if not self.command_started:
            self.command_started = True
            print('Command started')
        return 'OK'

    def stop(self):
        if self.command_started:
            self.command_started = False
            print('Command stopped')
        return 'OK'

    def do_click(self, json, clicks=1):
        if not self.command_started:
            return 'Command server not started', 400
        try:
            self.window.click(
                element_rect(json),
                window_rect(json),
                clicks=clicks
            )
            return 'OK', 200
        except ValueError as err:
            return str(err), 500

    def click(self, json):
        return self.do_click(json)

    def click_immediate(self):
        if not self.command_started:
            return 'Command server not started', 400
        self.window.click()
        return 'OK'

    def dblclick(self, json):
        return self.do_click(json, 2)

    def move(self, json):
        if not self.command_started:
            return 'Command server not started', 400
        self.window.moveTo(
            element_rect(json),
            window_rect(json)
        )
        return 'OK'
