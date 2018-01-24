import requests
from .jsonrpc import JSONRPC_VERSION, ResponseErrorException

# pylint: disable=too-few-public-methods
class JsonRpcClient:
    def __init__(self, port, host='localhost', path='/'):
        self.id = 0
        self.port = port
        self.host = host
        self.path = path
        self.version = JSONRPC_VERSION

    def _create_request(self, method, params):
        self.id += 1
        return {
            'id': self.id,
            'jsonrpc': self.version,
            'method': method,
            'params': params
        }

    def __getattr__(self, name):
        def method(*args, **kwargs):
            url = 'http://%s:%d%s' % (self.host, self.port, self.path)
            params = kwargs if kwargs else args
            json = self._create_request(name, params)
            resp = requests.post(url, json=json)
            json = resp.json()
            try:
                return json['result']
            except KeyError:
                raise ResponseErrorException(json)
        return method
