from .jsonrpc import success, JsonRpcException, ServerErrorException, RequestErrorException

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
        try:
            self.controller.move_to(
                element_rect(rect),
                window_rect(rect)
            )
            return 'OK'
        except ValueError as err:
            raise ServerErrorException(str(err))

    def key_press(self, key):
        self.controller.key_press(key)
        return 'OK'

    def do_click(self, rect, clicks=1):
        try:
            self.controller.click(
                element_rect(rect),
                window_rect(rect),
                clicks=clicks
            )
            return 'OK'
        except ValueError as err:
            raise ServerErrorException(str(err))

    def handle_request(self, json):
        req_id = json['id']
        method_name = json['method']
        try:
            method = self.methods.get(method_name, None)
            method = getattr(self, method_name, method)
            if method is None:
                raise AttributeError
        except AttributeError:
            exc = RequestErrorException('Unknown method "%s"' % method_name)
            return exc.to_json(req_id)

        try:
            params = json.get('params', [])
            if isinstance(params, dict):
                result = method(**params)
            else:
                result = method(*params)
            return success(req_id, result)
        except JsonRpcException as err:
            return err.to_json(req_id)

    def add_method(self, name, func):
        self.methods[name] = func
        return self
