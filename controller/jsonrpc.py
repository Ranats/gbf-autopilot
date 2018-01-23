JSONRPC_VERSION = '2.0'

def success(req_id, result):
    return {
        'id': req_id,
        'jsonrpc': JSONRPC_VERSION,
        'result': result
    }

def error(req_id, code, message, data=None):
    return {
        'id': req_id,
        'jsonrpc': JSONRPC_VERSION,
        'error': {
            'code': code,
            'message': message,
            'data': data
        }
    }

def request_error(req_id, message, data=None):
    return error(req_id, 400, message, data)

def server_error(req_id, message, data=None):
    return error(req_id, 500, message, data)

class JsonRpcException(Exception):
    def __init__(self, code, message, data=None):
        Exception.__init__(self, message)
        self.code = code
        self.message = message
        self.data = data

    def to_json(self, req_id):
        return error(req_id, self.code, self.message, self.data)

class ResponseErrorException(Exception):
    def __init__(self, json):
        Exception.__init__(self, json.error.message)
        self.json = json
        self.code = json.error.code
        self.data = json.error.data

class RequestErrorException(JsonRpcException):
    def __init__(self, message, data=None):
        JsonRpcException.__init__(self, 400, message, data)

    def to_json(self, req_id):
        return request_error(req_id, self.message, self.data)

class ServerErrorException(JsonRpcException):
    def __init__(self, message, data=None):
        JsonRpcException.__init__(self, 500, message, data)

    def to_json(self, req_id):
        return server_error(req_id, self.message, self.data)
