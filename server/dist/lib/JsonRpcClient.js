"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.JSONRPC_VERSION = undefined;exports.default =











JsonRpcClient;var _url = require("url");var _axios = require("axios");var _axios2 = _interopRequireDefault(_axios);var _shortid = require("shortid");var _shortid2 = _interopRequireDefault(_shortid);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var JSONRPC_VERSION = exports.JSONRPC_VERSION = "2.0"; /**
                                                                                                                                                                                                                                                                                                                                                           * Create a JSON-RPC client
                                                                                                                                                                                                                                                                                                                                                           * @param {number} port Port of the server
                                                                                                                                                                                                                                                                                                                                                           * @param {string} [host=localhost] Hostname of the server
                                                                                                                                                                                                                                                                                                                                                           * @param {string} [path=/] Path endpoint
                                                                                                                                                                                                                                                                                                                                                           */function JsonRpcClient(port, host, path) {host = host || "localhost";path = path || "/";return new Proxy({ port: port, host: host, path: path,
    version: JSONRPC_VERSION,

    getUrl: function getUrl() {
      return new _url.URL(path, "http://" + this.host + ":" + this.port);
    },

    request: function request(method) {
      var params = null;for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}
      if (args.length > 0) {
        if (args.length > 1) {
          params = args;
        } else {
          params = args[0];
        }
      }

      var url = this.getUrl().toString();
      var data = {
        id: _shortid2.default.generate(),
        jsonrpc: this.version,
        method: method };

      if (params) data.params = params;
      return _axios2.default.post(url, data).then(function (resp) {var _resp$data =
        resp.data,result = _resp$data.result,error = _resp$data.error;
        if (error) {
          throw Object.assign(new Error(error.message), {
            code: error.code,
            data: error.data });

        }
        return result;
      });
    } },
  {
    get: function get(target, prop) {
      if (target[prop]) return target[prop];
      return function (arg) {for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {args[_key2 - 1] = arguments[_key2];}
        return target.request.apply(target, [prop, arg].concat(args));
      };
    } });

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYlxcSnNvblJwY0NsaWVudC5qcyJdLCJuYW1lcyI6WyJKc29uUnBjQ2xpZW50IiwiSlNPTlJQQ19WRVJTSU9OIiwicG9ydCIsImhvc3QiLCJwYXRoIiwiUHJveHkiLCJ2ZXJzaW9uIiwiZ2V0VXJsIiwicmVxdWVzdCIsIm1ldGhvZCIsInBhcmFtcyIsImFyZ3MiLCJsZW5ndGgiLCJ1cmwiLCJ0b1N0cmluZyIsImRhdGEiLCJpZCIsImdlbmVyYXRlIiwianNvbnJwYyIsInBvc3QiLCJ0aGVuIiwicmVzcCIsInJlc3VsdCIsImVycm9yIiwiT2JqZWN0IiwiYXNzaWduIiwiRXJyb3IiLCJtZXNzYWdlIiwiY29kZSIsImdldCIsInRhcmdldCIsInByb3AiLCJhcmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVl3QkEsYSxDQVp4QiwwQkFDQSw4Qiw2Q0FDQSxrQyw4SUFFTyxJQUFNQyw0Q0FBa0IsS0FBeEIsQyxDQUVQOzs7Ozs2VkFNZSxTQUFTRCxhQUFULENBQXVCRSxJQUF2QixFQUE2QkMsSUFBN0IsRUFBbUNDLElBQW5DLEVBQXlDLENBQ3RERCxPQUFPQSxRQUFRLFdBQWYsQ0FDQUMsT0FBT0EsUUFBUSxHQUFmLENBRUEsT0FBTyxJQUFJQyxLQUFKLENBQVUsRUFDZkgsVUFEZSxFQUNUQyxVQURTLEVBQ0hDLFVBREc7QUFFZkUsYUFBU0wsZUFGTTs7QUFJZk0sVUFKZSxvQkFJTjtBQUNQLGFBQU8sYUFBUUgsSUFBUixjQUF3QixLQUFLRCxJQUE3QixTQUFxQyxLQUFLRCxJQUExQyxDQUFQO0FBQ0QsS0FOYzs7QUFRZk0sV0FSZSxtQkFRUEMsTUFSTyxFQVFVO0FBQ3ZCLFVBQUlDLFNBQVMsSUFBYixDQUR1QixrQ0FBTkMsSUFBTSxtRUFBTkEsSUFBTTtBQUV2QixVQUFJQSxLQUFLQyxNQUFMLEdBQWMsQ0FBbEIsRUFBcUI7QUFDbkIsWUFBSUQsS0FBS0MsTUFBTCxHQUFjLENBQWxCLEVBQXFCO0FBQ25CRixtQkFBU0MsSUFBVDtBQUNELFNBRkQsTUFFTztBQUNMRCxtQkFBU0MsS0FBSyxDQUFMLENBQVQ7QUFDRDtBQUNGOztBQUVELFVBQU1FLE1BQU0sS0FBS04sTUFBTCxHQUFjTyxRQUFkLEVBQVo7QUFDQSxVQUFNQyxPQUFPO0FBQ1hDLFlBQUksa0JBQVFDLFFBQVIsRUFETztBQUVYQyxpQkFBUyxLQUFLWixPQUZIO0FBR1hHLHNCQUhXLEVBQWI7O0FBS0EsVUFBSUMsTUFBSixFQUFZSyxLQUFLTCxNQUFMLEdBQWNBLE1BQWQ7QUFDWixhQUFPLGdCQUFNUyxJQUFOLENBQVdOLEdBQVgsRUFBZ0JFLElBQWhCLEVBQXNCSyxJQUF0QixDQUEyQixVQUFDQyxJQUFELEVBQVU7QUFDbEJBLGFBQUtOLElBRGEsQ0FDbkNPLE1BRG1DLGNBQ25DQSxNQURtQyxDQUMzQkMsS0FEMkIsY0FDM0JBLEtBRDJCO0FBRTFDLFlBQUlBLEtBQUosRUFBVztBQUNULGdCQUFNQyxPQUFPQyxNQUFQLENBQWMsSUFBSUMsS0FBSixDQUFVSCxNQUFNSSxPQUFoQixDQUFkLEVBQXdDO0FBQzVDQyxrQkFBTUwsTUFBTUssSUFEZ0M7QUFFNUNiLGtCQUFNUSxNQUFNUixJQUZnQyxFQUF4QyxDQUFOOztBQUlEO0FBQ0QsZUFBT08sTUFBUDtBQUNELE9BVE0sQ0FBUDtBQVVELEtBbkNjLEVBQVY7QUFvQ0o7QUFDRE8sT0FEQyxlQUNHQyxNQURILEVBQ1dDLElBRFgsRUFDaUI7QUFDaEIsVUFBSUQsT0FBT0MsSUFBUCxDQUFKLEVBQWtCLE9BQU9ELE9BQU9DLElBQVAsQ0FBUDtBQUNsQixhQUFPLFVBQUNDLEdBQUQsRUFBa0Isb0NBQVRyQixJQUFTLHlFQUFUQSxJQUFTO0FBQ3ZCLGVBQU9tQixPQUFPdEIsT0FBUCxnQkFBZXVCLElBQWYsRUFBcUJDLEdBQXJCLFNBQTZCckIsSUFBN0IsRUFBUDtBQUNELE9BRkQ7QUFHRCxLQU5BLEVBcENJLENBQVA7O0FBNENEIiwiZmlsZSI6ImxpYlxcSnNvblJwY0NsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VVJMfSBmcm9tIFwidXJsXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSBcImF4aW9zXCI7XG5pbXBvcnQgc2hvcnRpZCBmcm9tIFwic2hvcnRpZFwiO1xuXG5leHBvcnQgY29uc3QgSlNPTlJQQ19WRVJTSU9OID0gXCIyLjBcIjtcblxuLyoqXG4gKiBDcmVhdGUgYSBKU09OLVJQQyBjbGllbnRcbiAqIEBwYXJhbSB7bnVtYmVyfSBwb3J0IFBvcnQgb2YgdGhlIHNlcnZlclxuICogQHBhcmFtIHtzdHJpbmd9IFtob3N0PWxvY2FsaG9zdF0gSG9zdG5hbWUgb2YgdGhlIHNlcnZlclxuICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoPS9dIFBhdGggZW5kcG9pbnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gSnNvblJwY0NsaWVudChwb3J0LCBob3N0LCBwYXRoKSB7XG4gIGhvc3QgPSBob3N0IHx8IFwibG9jYWxob3N0XCI7XG4gIHBhdGggPSBwYXRoIHx8IFwiL1wiO1xuICBcbiAgcmV0dXJuIG5ldyBQcm94eSh7XG4gICAgcG9ydCwgaG9zdCwgcGF0aCxcbiAgICB2ZXJzaW9uOiBKU09OUlBDX1ZFUlNJT04sXG5cbiAgICBnZXRVcmwoKSB7XG4gICAgICByZXR1cm4gbmV3IFVSTChwYXRoLCBgaHR0cDovLyR7dGhpcy5ob3N0fToke3RoaXMucG9ydH1gKTtcbiAgICB9LFxuXG4gICAgcmVxdWVzdChtZXRob2QsIC4uLmFyZ3MpIHtcbiAgICAgIHZhciBwYXJhbXMgPSBudWxsO1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoYXJncy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgcGFyYW1zID0gYXJncztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXJhbXMgPSBhcmdzWzBdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVybCA9IHRoaXMuZ2V0VXJsKCkudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIGlkOiBzaG9ydGlkLmdlbmVyYXRlKCksXG4gICAgICAgIGpzb25ycGM6IHRoaXMudmVyc2lvbixcbiAgICAgICAgbWV0aG9kXG4gICAgICB9O1xuICAgICAgaWYgKHBhcmFtcykgZGF0YS5wYXJhbXMgPSBwYXJhbXM7XG4gICAgICByZXR1cm4gYXhpb3MucG9zdCh1cmwsIGRhdGEpLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgY29uc3Qge3Jlc3VsdCwgZXJyb3J9ID0gcmVzcC5kYXRhO1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICB0aHJvdyBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKSwge1xuICAgICAgICAgICAgY29kZTogZXJyb3IuY29kZSxcbiAgICAgICAgICAgIGRhdGE6IGVycm9yLmRhdGFcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gICAgfSAgIFxuICB9LCB7XG4gICAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgICAgaWYgKHRhcmdldFtwcm9wXSkgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgIHJldHVybiAoYXJnLCAuLi5hcmdzKSA9PiB7XG4gICAgICAgIHJldHVybiB0YXJnZXQucmVxdWVzdChwcm9wLCBhcmcsIC4uLmFyZ3MpO1xuICAgICAgfTtcbiAgICB9XG4gIH0pO1xufVxuIl19