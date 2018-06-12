"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _lodash = require("lodash");var _lodash2 = _interopRequireDefault(_lodash);
var _shortid = require("shortid");var _shortid2 = _interopRequireDefault(_shortid);
var _bluebird = require("bluebird");var _bluebird2 = _interopRequireDefault(_bluebird);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

PortMessaging = function () {
  function PortMessaging() {_classCallCheck(this, PortMessaging);
    this.connected = false;
    this.messageQueue = [];
    this.unsentMessages = [];
    this.pendingMessages = {};
    this.onRequest = _lodash2.default.noop;
    this.onBroadcast = _lodash2.default.noop;
    this.middlewares = {
      receive: [],
      send: [] };

    this.listeners = {
      onMessage: this.onMessage.bind(this),
      onDisconnect: this.onDisconnect.bind(this) };

  }_createClass(PortMessaging, [{ key: "isConnected", value: function isConnected()

    {
      return this.connected && this.port;
    } }, { key: "setup", value: function setup(

    port, setupListeners) {
      this.port = port;
      this.connected = true;
      setupListeners(port, this.listeners);
      this.resendMessages();
    } }, { key: "changePort", value: function changePort(

    newPort, setupListeners, doDisconnect, removeListeners) {
      doDisconnect(this.port);
      (removeListeners || _lodash2.default.noop)(this.port, this.listeners);
      this.setup(newPort, setupListeners);
    } }, { key: "middleware", value: function middleware(

    type, _middleware) {
      if (_lodash2.default.isArray(_middleware)) {
        _lodash2.default.each(_middleware, this.middleware.bind(this));
        return;
      }
      this.middlewares[type].push(_middleware);
    } }, { key: "runMiddlewares", value: function runMiddlewares(

    type, message) {var _this = this;
      return new _bluebird2.default(function (resolve, reject) {
        // go through the middlewares
        var next = function next(nextMessage, index) {
          if (index >= _this.middlewares[type].length) {
            resolve(nextMessage);
            return;
          }
          _this.middlewares[type][index](nextMessage, function (anotherMessage) {
            next(anotherMessage, ++index);
          }, reject);
        };
        next(message, 0);
      });
    } }, { key: "onMessage", value: function onMessage(

    originalMessage) {var _this2 = this,_context;
      this.runMiddlewares("receive", originalMessage).then(function (message) {
        if (!message.id) return;
        if (message.type == "request") {
          _this2.onRequest.call(_this2, message, function (response, success) {
            _this2.sendResponse(message.id, message.action, response, success);
          });
        } else if (message.type == "response") {
          _this2.dequeueMessage(message.id, message.payload, message.success);
        } else if (message.type == "broadcast") {
          _this2.onBroadcast.call(_this2, message);
        }
      }, (_context = console).error.bind(_context));
    } }, { key: "onDisconnect", value: function onDisconnect()

    {
      this.connected = false;
    } }, { key: "queueMessage", value: function queueMessage(

    message, timeout) {var _this3 = this;
      return new _bluebird2.default(function (resolve, reject) {
        var id = _shortid2.default.generate();
        message.id = id;
        _this3.messageQueue.push(id);
        _this3.pendingMessages[id] = { message: message, resolve: resolve, reject: reject };
        _this3.sendMessage(message);

        if (_lodash2.default.isNumber(timeout) && timeout > 0) {
          setTimeout(function () {
            _this3.dequeueMessage(id, new Error("Timed out!"), false);
          }, timeout);
        }
      });
    } }, { key: "dequeueMessage", value: function dequeueMessage(

    id, result, success) {
      var pending = this.pendingMessages[id];
      if (!pending) return;
      var index = this.messageQueue.indexOf(pending);
      if (index >= 0) {
        this.messageQueue.splice(index, 1);
      }
      delete this.pendingMessages[id];
      if (success) {
        pending.resolve(result);
      } else {
        pending.reject(result);
      }
    } }, { key: "resendMessages", value: function resendMessages()

    {var _this4 = this;
      _lodash2.default.each(this.messageQueue, function (id) {
        var pending = _this4.pendingMessages[id];
        if (!pending) return;
        _this4.sendMessage(pending.message);
      });
      while (this.unsentMessages.length > 0) {
        var message = this.unsentMessages.pop();
        this.sendMessage(message);
      }
    } }, { key: "sendRequest", value: function sendRequest(

    action, payload, timeout) {
      var message = { action: action, payload: payload, type: "request", timeout: timeout };
      return this.queueMessage(message, timeout);
    } }, { key: "sendResponse", value: function sendResponse(

    id, action, payload, success) {
      this.sendMessage({
        id: id, action: action, payload: payload,
        type: "response",
        success: success !== false });

    } }, { key: "sendBroadcast", value: function sendBroadcast(

    id, action, payload) {
      this.sendMessage({
        id: id, action: action, payload: payload,
        type: "broadcast" });

    } }, { key: "sendMessage", value: function sendMessage(

    originalMessage) {var _this5 = this,_context2;
      if (!this.isConnected()) {
        this.unsentMessages.push(originalMessage);
        return;
      }
      this.runMiddlewares("send", originalMessage).then(function (message) {
        _this5.port.postMessage(message);
      }, (_context2 = console).error.bind(_context2));
    } }]);return PortMessaging;}();exports.default = PortMessaging;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYlxcbWVzc2FnaW5nXFxQb3J0TWVzc2FnaW5nLmpzIl0sIm5hbWVzIjpbIlBvcnRNZXNzYWdpbmciLCJjb25uZWN0ZWQiLCJtZXNzYWdlUXVldWUiLCJ1bnNlbnRNZXNzYWdlcyIsInBlbmRpbmdNZXNzYWdlcyIsIm9uUmVxdWVzdCIsIm5vb3AiLCJvbkJyb2FkY2FzdCIsIm1pZGRsZXdhcmVzIiwicmVjZWl2ZSIsInNlbmQiLCJsaXN0ZW5lcnMiLCJvbk1lc3NhZ2UiLCJvbkRpc2Nvbm5lY3QiLCJwb3J0Iiwic2V0dXBMaXN0ZW5lcnMiLCJyZXNlbmRNZXNzYWdlcyIsIm5ld1BvcnQiLCJkb0Rpc2Nvbm5lY3QiLCJyZW1vdmVMaXN0ZW5lcnMiLCJzZXR1cCIsInR5cGUiLCJtaWRkbGV3YXJlIiwiaXNBcnJheSIsImVhY2giLCJwdXNoIiwibWVzc2FnZSIsInJlc29sdmUiLCJyZWplY3QiLCJuZXh0IiwibmV4dE1lc3NhZ2UiLCJpbmRleCIsImxlbmd0aCIsImFub3RoZXJNZXNzYWdlIiwib3JpZ2luYWxNZXNzYWdlIiwicnVuTWlkZGxld2FyZXMiLCJ0aGVuIiwiaWQiLCJjYWxsIiwicmVzcG9uc2UiLCJzdWNjZXNzIiwic2VuZFJlc3BvbnNlIiwiYWN0aW9uIiwiZGVxdWV1ZU1lc3NhZ2UiLCJwYXlsb2FkIiwiZXJyb3IiLCJ0aW1lb3V0IiwiZ2VuZXJhdGUiLCJzZW5kTWVzc2FnZSIsImlzTnVtYmVyIiwic2V0VGltZW91dCIsIkVycm9yIiwicmVzdWx0IiwicGVuZGluZyIsImluZGV4T2YiLCJzcGxpY2UiLCJwb3AiLCJxdWV1ZU1lc3NhZ2UiLCJpc0Nvbm5lY3RlZCIsInBvc3RNZXNzYWdlIl0sIm1hcHBpbmdzIjoiZ25CQUFBLGdDO0FBQ0Esa0M7QUFDQSxvQzs7QUFFcUJBLGE7QUFDbkIsMkJBQWM7QUFDWixTQUFLQyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQixFQUFwQjtBQUNBLFNBQUtDLGNBQUwsR0FBc0IsRUFB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QzNCLFVBQUksQ0FBQyxLQUFLd0IsV0FBTCxFQUFMLEVBQXlCO0FBQ3ZCLGFBQUt2RCxjQUFMLENBQW9Cc0IsSUFBcEIsQ0FBeUJTLGVBQXpCO0FBQ0E7QUFDRDtBQUNELFdBQUtDLGNBQUwsQ0FBb0IsTUFBcEIsRUFBNEJELGVBQTVCLEVBQTZDRSxJQUE3QyxDQUFrRCxVQUFDVixPQUFELEVBQWE7QUFDN0QsZUFBS1osSUFBTCxDQUFVNkMsV0FBVixDQUFzQmpDLE9BQXRCO0FBQ0QsT0FGRCxFQUVLLHNCQUFRbUIsS0FGYjtBQUdELEssZ0RBckprQjdDLGEiLCJmaWxlIjoibGliXFxtZXNzYWdpbmdcXFBvcnRNZXNzYWdpbmcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgc2hvcnRpZCBmcm9tIFwic2hvcnRpZFwiO1xuaW1wb3J0IFByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvcnRNZXNzYWdpbmcge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmNvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMubWVzc2FnZVF1ZXVlID0gW107XG4gICAgdGhpcy51bnNlbnRNZXNzYWdlcyA9IFtdO1xuICAgIHRoaXMucGVuZGluZ01lc3NhZ2VzID0ge307XG4gICAgdGhpcy5vblJlcXVlc3QgPSBfLm5vb3A7XG4gICAgdGhpcy5vbkJyb2FkY2FzdCA9IF8ubm9vcDtcbiAgICB0aGlzLm1pZGRsZXdhcmVzID0ge1xuICAgICAgcmVjZWl2ZTogW10sXG4gICAgICBzZW5kOiBbXVxuICAgIH07XG4gICAgdGhpcy5saXN0ZW5lcnMgPSB7XG4gICAgICBvbk1lc3NhZ2U6IDo6dGhpcy5vbk1lc3NhZ2UsXG4gICAgICBvbkRpc2Nvbm5lY3Q6IDo6dGhpcy5vbkRpc2Nvbm5lY3RcbiAgICB9O1xuICB9XG5cbiAgaXNDb25uZWN0ZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGVkICYmIHRoaXMucG9ydDtcbiAgfVxuXG4gIHNldHVwKHBvcnQsIHNldHVwTGlzdGVuZXJzKSB7XG4gICAgdGhpcy5wb3J0ID0gcG9ydDtcbiAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWU7XG4gICAgc2V0dXBMaXN0ZW5lcnMocG9ydCwgdGhpcy5saXN0ZW5lcnMpO1xuICAgIHRoaXMucmVzZW5kTWVzc2FnZXMoKTtcbiAgfVxuXG4gIGNoYW5nZVBvcnQobmV3UG9ydCwgc2V0dXBMaXN0ZW5lcnMsIGRvRGlzY29ubmVjdCwgcmVtb3ZlTGlzdGVuZXJzKSB7XG4gICAgZG9EaXNjb25uZWN0KHRoaXMucG9ydCk7XG4gICAgKHJlbW92ZUxpc3RlbmVycyB8fCBfLm5vb3ApKHRoaXMucG9ydCwgdGhpcy5saXN0ZW5lcnMpO1xuICAgIHRoaXMuc2V0dXAobmV3UG9ydCwgc2V0dXBMaXN0ZW5lcnMpO1xuICB9XG5cbiAgbWlkZGxld2FyZSh0eXBlLCBtaWRkbGV3YXJlKSB7XG4gICAgaWYgKF8uaXNBcnJheShtaWRkbGV3YXJlKSkge1xuICAgICAgXy5lYWNoKG1pZGRsZXdhcmUsIDo6dGhpcy5taWRkbGV3YXJlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5taWRkbGV3YXJlc1t0eXBlXS5wdXNoKG1pZGRsZXdhcmUpO1xuICB9XG5cbiAgcnVuTWlkZGxld2FyZXModHlwZSwgbWVzc2FnZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBnbyB0aHJvdWdoIHRoZSBtaWRkbGV3YXJlc1xuICAgICAgY29uc3QgbmV4dCA9IChuZXh0TWVzc2FnZSwgaW5kZXgpID0+IHtcbiAgICAgICAgaWYgKGluZGV4ID49IHRoaXMubWlkZGxld2FyZXNbdHlwZV0ubGVuZ3RoKSB7XG4gICAgICAgICAgcmVzb2x2ZShuZXh0TWVzc2FnZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWlkZGxld2FyZXNbdHlwZV1baW5kZXhdKG5leHRNZXNzYWdlLCAoYW5vdGhlck1lc3NhZ2UpID0+IHtcbiAgICAgICAgICBuZXh0KGFub3RoZXJNZXNzYWdlLCArK2luZGV4KTtcbiAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgIH07XG4gICAgICBuZXh0KG1lc3NhZ2UsIDApO1xuICAgIH0pO1xuICB9XG5cbiAgb25NZXNzYWdlKG9yaWdpbmFsTWVzc2FnZSkge1xuICAgIHRoaXMucnVuTWlkZGxld2FyZXMoXCJyZWNlaXZlXCIsIG9yaWdpbmFsTWVzc2FnZSkudGhlbigobWVzc2FnZSkgPT4ge1xuICAgICAgaWYgKCFtZXNzYWdlLmlkKSByZXR1cm47XG4gICAgICBpZiAobWVzc2FnZS50eXBlID09IFwicmVxdWVzdFwiKSB7XG4gICAgICAgIHRoaXMub25SZXF1ZXN0LmNhbGwodGhpcywgbWVzc2FnZSwgKHJlc3BvbnNlLCBzdWNjZXNzKSA9PiB7XG4gICAgICAgICAgdGhpcy5zZW5kUmVzcG9uc2UobWVzc2FnZS5pZCwgbWVzc2FnZS5hY3Rpb24sIHJlc3BvbnNlLCBzdWNjZXNzKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PSBcInJlc3BvbnNlXCIpIHtcbiAgICAgICAgdGhpcy5kZXF1ZXVlTWVzc2FnZShtZXNzYWdlLmlkLCBtZXNzYWdlLnBheWxvYWQsIG1lc3NhZ2Uuc3VjY2Vzcyk7XG4gICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PSBcImJyb2FkY2FzdFwiKSB7XG4gICAgICAgIHRoaXMub25Ccm9hZGNhc3QuY2FsbCh0aGlzLCBtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9LCA6OmNvbnNvbGUuZXJyb3IpO1xuICB9XG5cbiAgb25EaXNjb25uZWN0KCkge1xuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2U7XG4gIH1cblxuICBxdWV1ZU1lc3NhZ2UobWVzc2FnZSwgdGltZW91dCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBpZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgIG1lc3NhZ2UuaWQgPSBpZDtcbiAgICAgIHRoaXMubWVzc2FnZVF1ZXVlLnB1c2goaWQpO1xuICAgICAgdGhpcy5wZW5kaW5nTWVzc2FnZXNbaWRdID0ge21lc3NhZ2UsIHJlc29sdmUsIHJlamVjdH07XG4gICAgICB0aGlzLnNlbmRNZXNzYWdlKG1lc3NhZ2UpO1xuXG4gICAgICBpZiAoXy5pc051bWJlcih0aW1lb3V0KSAmJiB0aW1lb3V0ID4gMCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLmRlcXVldWVNZXNzYWdlKGlkLCBuZXcgRXJyb3IoXCJUaW1lZCBvdXQhXCIpLCBmYWxzZSk7XG4gICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZGVxdWV1ZU1lc3NhZ2UoaWQsIHJlc3VsdCwgc3VjY2Vzcykge1xuICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLnBlbmRpbmdNZXNzYWdlc1tpZF07XG4gICAgaWYgKCFwZW5kaW5nKSByZXR1cm47XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLm1lc3NhZ2VRdWV1ZS5pbmRleE9mKHBlbmRpbmcpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICBkZWxldGUgdGhpcy5wZW5kaW5nTWVzc2FnZXNbaWRdO1xuICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICBwZW5kaW5nLnJlc29sdmUocmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGVuZGluZy5yZWplY3QocmVzdWx0KTtcbiAgICB9XG4gIH1cblxuICByZXNlbmRNZXNzYWdlcygpIHtcbiAgICBfLmVhY2godGhpcy5tZXNzYWdlUXVldWUsIChpZCkgPT4ge1xuICAgICAgY29uc3QgcGVuZGluZyA9IHRoaXMucGVuZGluZ01lc3NhZ2VzW2lkXTtcbiAgICAgIGlmICghcGVuZGluZykgcmV0dXJuO1xuICAgICAgdGhpcy5zZW5kTWVzc2FnZShwZW5kaW5nLm1lc3NhZ2UpO1xuICAgIH0pO1xuICAgIHdoaWxlICh0aGlzLnVuc2VudE1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLnVuc2VudE1lc3NhZ2VzLnBvcCgpO1xuICAgICAgdGhpcy5zZW5kTWVzc2FnZShtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBzZW5kUmVxdWVzdChhY3Rpb24sIHBheWxvYWQsIHRpbWVvdXQpIHtcbiAgICBjb25zdCBtZXNzYWdlID0ge2FjdGlvbiwgcGF5bG9hZCwgdHlwZTogXCJyZXF1ZXN0XCIsIHRpbWVvdXR9O1xuICAgIHJldHVybiB0aGlzLnF1ZXVlTWVzc2FnZShtZXNzYWdlLCB0aW1lb3V0KTtcbiAgfVxuXG4gIHNlbmRSZXNwb25zZShpZCwgYWN0aW9uLCBwYXlsb2FkLCBzdWNjZXNzKSB7XG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICBpZCwgYWN0aW9uLCBwYXlsb2FkLFxuICAgICAgdHlwZTogXCJyZXNwb25zZVwiLFxuICAgICAgc3VjY2Vzczogc3VjY2VzcyAhPT0gZmFsc2VcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmRCcm9hZGNhc3QoaWQsIGFjdGlvbiwgcGF5bG9hZCkge1xuICAgIHRoaXMuc2VuZE1lc3NhZ2Uoe1xuICAgICAgaWQsIGFjdGlvbiwgcGF5bG9hZCxcbiAgICAgIHR5cGU6IFwiYnJvYWRjYXN0XCIsXG4gICAgfSk7XG4gIH1cblxuICBzZW5kTWVzc2FnZShvcmlnaW5hbE1lc3NhZ2UpIHtcbiAgICBpZiAoIXRoaXMuaXNDb25uZWN0ZWQoKSkge1xuICAgICAgdGhpcy51bnNlbnRNZXNzYWdlcy5wdXNoKG9yaWdpbmFsTWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucnVuTWlkZGxld2FyZXMoXCJzZW5kXCIsIG9yaWdpbmFsTWVzc2FnZSkudGhlbigobWVzc2FnZSkgPT4ge1xuICAgICAgdGhpcy5wb3J0LnBvc3RNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH0sIDo6Y29uc29sZS5lcnJvcik7XG4gIH1cbn1cbiJdfQ==