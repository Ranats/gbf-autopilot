from .jsonrpc import success, server_error, request_error, JsonRpcException

def element_rect(rect):
    return (rect['x'], rect['y'], rect['width'], rect['height'])

def window_rect(rect):
    return (0, 0, rect['window']['width'], rect['window']['height'])

class JsonRpcMethods:
    def __init__(self, controller):
        self.controller = controller
        self.methods = {}

    def click(self, rect):
        return self.do_click(rect)

    def click_immediate(self):
        self.controller.click()
        return 'OK'

    def click_double(self, rect):
        return self.do_click(rect, 2)

    def move(self, rect):
        self.controller.move_to(
            element_rect(rect),
            window_rect(rect)
        )
        return 'OK'

    def key_press(self, key):
        self.controller.key_press(key)
        return 'OK'

    def do_click(self, rect, clicks=1):
        self.controller.click(
            element_rect(rect),
            window_rect(rect),
            clicks=clicks
        )
        return 'OK'

    def handle_request(self, json):
        req_id = json['id']
        method_name = json['method']
        try:
            method = self.methods.get(method_name, None)
            method = getattr(self, method_name, method)
            if method is None:
                raise AttributeError
        except AttributeError:
            return request_error(req_id, 'Unknown method "%s"' % method_name)

        try:
            params = json.get('params', None)
            if isinstance(params, list):
                result = method(*params)
            elif isinstance(params, dict):
                result = method(**params)
            elif params is not None:
                result = method(params)
            else:
                result = method()
            return success(req_id, result)
        except JsonRpcException as err:
            return err.to_json(req_id)
        except (RuntimeError, ValueError) as err:
            return server_error(req_id, str(err))

    def add_method(self, name, func):
        self.methods[name] = func
        return self
