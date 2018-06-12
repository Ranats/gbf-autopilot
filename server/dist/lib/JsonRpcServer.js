"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.JSONRPC_VERSION = undefined;var _bluebird = require("bluebird");var _bluebird2 = _interopRequireDefault(_bluebird);var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var JSONRPC_VERSION = exports.JSONRPC_VERSION = "2.0";var

JsonRpcServer = function () {
  function JsonRpcServer(app, methods, path) {_classCallCheck(this, JsonRpcServer);
    this.app = app;
    this.methods = methods;
    this.path = path || "/";
    this.setupEndpoint();
  }_createClass(JsonRpcServer, [{ key: "success", value: function success(

    id, result) {
      return JSON.stringify({
        id: id,
        jsonrpc: JSONRPC_VERSION,
        result: result });

    } }, { key: "error", value: function error(

    id, _error) {
      var code = _error.code || 500;
      var message = _error.message || _error.toString();
      var data = _error.data;
      return JSON.stringify({
        id: id,
        jsonrpc: JSONRPC_VERSION,
        error: { code: code, message: message, data: data } });

    } }, { key: "handleRequest", value: function handleRequest(

    req, res) {var _this = this;var _req$body =
      req.body,id = _req$body.id,method = _req$body.method,params = _req$body.params;
      var methodFunc = this.methods[method];
      if (!methodFunc) {
        return res.end(this.error(id, 404, "Method unknown"));
      }

      var result = methodFunc(params);
      try {
        if (result instanceof _bluebird2.default) {
          return result.then(function (result) {
            return _this.success(id, result);
          }, function (err) {
            return _this.error(id, err);
          }).then(function (json) {return res.end(json);});
        } else if (result instanceof Error) {
          return res.end(this.error(id, result));
        } else {
          return res.end(this.success(id, result));
        }
      } catch (err) {
        return res.end(this.error(id, err));
      }
    } }, { key: "setupEndpoint", value: function setupEndpoint()

    {
      this.app.post(this.path, this.handleRequest.bind(this));
    } }]);return JsonRpcServer;}();exports.default = JsonRpcServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYlxcSnNvblJwY1NlcnZlci5qcyJdLCJuYW1lcyI6WyJKU09OUlBDX1ZFUlNJT04iLCJKc29uUnBjU2VydmVyIiwiYXBwIiwibWV0aG9kcyIsInBhdGgiLCJzZXR1cEVuZHBvaW50IiwiaWQiLCJyZXN1bHQiLCJKU09OIiwic3RyaW5naWZ5IiwianNvbnJwYyIsImVycm9yIiwiY29kZSIsIm1lc3NhZ2UiLCJ0b1N0cmluZyIsImRhdGEiLCJyZXEiLCJyZXMiLCJib2R5IiwibWV0aG9kIiwicGFyYW1zIiwibWV0aG9kRnVuYyIsImVuZCIsInRoZW4iLCJzdWNjZXNzIiwiZXJyIiwianNvbiIsIkVycm9yIiwicG9zdCIsImhhbmRsZVJlcXVlc3QiXSwibWFwcGluZ3MiOiI2OUJBQU8sSUFBTUEsNENBQWtCLEtBQXhCLEM7O0FBRWNDLGE7QUFDbkIseUJBQVlDLEdBQVosRUFBaUJDLE9BQWpCLEVBQTBCQyxJQUExQixFQUFnQztBQUM5QixTQUFLRixHQUFMLEdBQVdBLEdBQVg7QUFDQSxTQUFLQyxPQUFMLEdBQWVBLE9BQWY7QUFDQSxTQUFLQyxJQUFMLEdBQVlBLFFBQVEsR0FBcEI7QUFDQSxTQUFLQyxhQUFMO0FBQ0QsRzs7QUFFT0MsTSxFQUFJQyxNLEVBQVE7QUFDbEIsYUFBT0MsS0FBS0MsU0FBTCxDQUFlO0FBQ3BCSCxjQURvQjtBQUVwQkksaUJBQVNWLGVBRlc7QUFHcEJPLHNCQUhvQixFQUFmLENBQVA7O0FBS0QsSzs7QUFFS0QsTSxFQUFJSyxNLEVBQU87QUFDZixVQUFNQyxPQUFPRCxPQUFNQyxJQUFOLElBQWMsR0FBM0I7QUFDQSxVQUFNQyxVQUFVRixPQUFNRSxPQUFOLElBQWlCRixPQUFNRyxRQUFOLEVBQWpDO0FBQ0EsVUFBTUMsT0FBT0osT0FBTUksSUFBbkI7QUFDQSxhQUFPUCxLQUFLQyxTQUFMLENBQWU7QUFDcEJILGNBRG9CO0FBRXBCSSxpQkFBU1YsZUFGVztBQUdwQlcsZUFBTyxFQUFDQyxVQUFELEVBQU9DLGdCQUFQLEVBQWdCRSxVQUFoQixFQUhhLEVBQWYsQ0FBUDs7QUFLRCxLOztBQUVhQyxPLEVBQUtDLEcsRUFBSztBQUNPRCxVQUFJRSxJQURYLENBQ2ZaLEVBRGUsYUFDZkEsRUFEZSxDQUNYYSxNQURXLGFBQ1hBLE1BRFcsQ0FDSEMsTUFERyxhQUNIQSxNQURHO0FBRXRCLFVBQU1DLGFBQWEsS0FBS2xCLE9BQUwsQ0FBYWdCLE1BQWIsQ0FBbkI7QUFDQSxVQUFJLENBQUNFLFVBQUwsRUFBaUI7QUFDZixlQUFPSixJQUFJSyxHQUFKLENBQVEsS0FBS1gsS0FBTCxDQUFXTCxFQUFYLEVBQWUsR0FBZixFQUFvQixnQkFBcEIsQ0FBUixDQUFQO0FBQ0Q7O0FBRUQsVUFBTUMsU0FBU2MsV0FBV0QsTUFBWCxDQUFmO0FBQ0EsVUFBSTtBQUNGLFlBQUliLG9DQUFKLEVBQStCO0FBQzdCLGlCQUFPQSxPQUFPZ0IsSUFBUCxDQUFZLFVBQUNoQixNQUFELEVBQVk7QUFDN0IsbUJBQU8sTUFBS2lCLE9BQUwsQ0FBYWxCLEVBQWIsRUFBaUJDLE1BQWpCLENBQVA7QUFDRCxXQUZNLEVBRUosVUFBQ2tCLEdBQUQsRUFBUztBQUNWLG1CQUFPLE1BQUtkLEtBQUwsQ0FBV0wsRUFBWCxFQUFlbUIsR0FBZixDQUFQO0FBQ0QsV0FKTSxFQUlKRixJQUpJLENBSUMsVUFBQ0csSUFBRCxVQUFVVCxJQUFJSyxHQUFKLENBQVFJLElBQVIsQ0FBVixFQUpELENBQVA7QUFLRCxTQU5ELE1BTU8sSUFBSW5CLGtCQUFrQm9CLEtBQXRCLEVBQTZCO0FBQ2xDLGlCQUFPVixJQUFJSyxHQUFKLENBQVEsS0FBS1gsS0FBTCxDQUFXTCxFQUFYLEVBQWVDLE1BQWYsQ0FBUixDQUFQO0FBQ0QsU0FGTSxNQUVBO0FBQ0wsaUJBQU9VLElBQUlLLEdBQUosQ0FBUSxLQUFLRSxPQUFMLENBQWFsQixFQUFiLEVBQWlCQyxNQUFqQixDQUFSLENBQVA7QUFDRDtBQUNGLE9BWkQsQ0FZRSxPQUFPa0IsR0FBUCxFQUFZO0FBQ1osZUFBT1IsSUFBSUssR0FBSixDQUFRLEtBQUtYLEtBQUwsQ0FBV0wsRUFBWCxFQUFlbUIsR0FBZixDQUFSLENBQVA7QUFDRDtBQUNGLEs7O0FBRWU7QUFDZCxXQUFLdkIsR0FBTCxDQUFTMEIsSUFBVCxDQUFjLEtBQUt4QixJQUFuQixFQUEyQixLQUFLeUIsYUFBaEMsTUFBMkIsSUFBM0I7QUFDRCxLLGdEQXREa0I1QixhIiwiZmlsZSI6ImxpYlxcSnNvblJwY1NlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBKU09OUlBDX1ZFUlNJT04gPSBcIjIuMFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBKc29uUnBjU2VydmVyIHtcbiAgY29uc3RydWN0b3IoYXBwLCBtZXRob2RzLCBwYXRoKSB7XG4gICAgdGhpcy5hcHAgPSBhcHA7XG4gICAgdGhpcy5tZXRob2RzID0gbWV0aG9kcztcbiAgICB0aGlzLnBhdGggPSBwYXRoIHx8IFwiL1wiO1xuICAgIHRoaXMuc2V0dXBFbmRwb2ludCgpO1xuICB9XG5cbiAgc3VjY2VzcyhpZCwgcmVzdWx0KSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGlkLFxuICAgICAganNvbnJwYzogSlNPTlJQQ19WRVJTSU9OLFxuICAgICAgcmVzdWx0XG4gICAgfSk7XG4gIH1cblxuICBlcnJvcihpZCwgZXJyb3IpIHtcbiAgICBjb25zdCBjb2RlID0gZXJyb3IuY29kZSB8fCA1MDA7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2UgfHwgZXJyb3IudG9TdHJpbmcoKTtcbiAgICBjb25zdCBkYXRhID0gZXJyb3IuZGF0YTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgaWQsXG4gICAgICBqc29ucnBjOiBKU09OUlBDX1ZFUlNJT04sXG4gICAgICBlcnJvcjoge2NvZGUsIG1lc3NhZ2UsIGRhdGF9XG4gICAgfSk7XG4gIH1cblxuICBoYW5kbGVSZXF1ZXN0KHJlcSwgcmVzKSB7XG4gICAgY29uc3Qge2lkLCBtZXRob2QsIHBhcmFtc30gPSByZXEuYm9keTtcbiAgICBjb25zdCBtZXRob2RGdW5jID0gdGhpcy5tZXRob2RzW21ldGhvZF07XG4gICAgaWYgKCFtZXRob2RGdW5jKSB7XG4gICAgICByZXR1cm4gcmVzLmVuZCh0aGlzLmVycm9yKGlkLCA0MDQsIFwiTWV0aG9kIHVua25vd25cIikpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdCA9IG1ldGhvZEZ1bmMocGFyYW1zKTtcbiAgICB0cnkge1xuICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5zdWNjZXNzKGlkLCByZXN1bHQpO1xuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZXJyb3IoaWQsIGVycik7XG4gICAgICAgIH0pLnRoZW4oKGpzb24pID0+IHJlcy5lbmQoanNvbikpO1xuICAgICAgfSBlbHNlIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICByZXR1cm4gcmVzLmVuZCh0aGlzLmVycm9yKGlkLCByZXN1bHQpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZXMuZW5kKHRoaXMuc3VjY2VzcyhpZCwgcmVzdWx0KSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gcmVzLmVuZCh0aGlzLmVycm9yKGlkLCBlcnIpKTtcbiAgICB9XG4gIH1cblxuICBzZXR1cEVuZHBvaW50KCkge1xuICAgIHRoaXMuYXBwLnBvc3QodGhpcy5wYXRoLCA6OnRoaXMuaGFuZGxlUmVxdWVzdCk7XG4gIH1cbn1cbiJdfQ==