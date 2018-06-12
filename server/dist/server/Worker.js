"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _bluebird = require("bluebird");var _bluebird2 = _interopRequireDefault(_bluebird);var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _Rx = require("rxjs/Rx");var _Rx2 = _interopRequireDefault(_Rx);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

Worker = function () {
  function Worker(server, config, socket) {_classCallCheck(this, Worker);
    this.server = server;
    this.logger = server.logger;
    this.defaultErrorHandler = server.defaultErrorHandler.bind(server);

    this.subject = new _Rx2.default.Subject();
    this.observers = new WeakMap();

    this.config = config;
    this.socket = socket;
    this.port = Number(config.get("Controller.ListenerPort"));

    this.processTimeout = Number(config.get("Server.ProcessTimeoutInMs"));
    this.workerTimeout = Number(config.get("Server.WorkerTimeoutInMs"));
  }_createClass(Worker, [{ key: "sendAction", value: function () {var _ref = (0, _bluebird.coroutine)( /*#__PURE__*/regeneratorRuntime.mark(function _callee(

      actionName, payload, timeout) {return regeneratorRuntime.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return (0, _bluebird.resolve)(
                this.server.sendAction(
                this.socket,
                actionName,
                payload,
                timeout));case 2:return _context.abrupt("return", _context.sent);case 3:case "end":return _context.stop();}}}, _callee, this);}));function sendAction(_x, _x2, _x3) {return _ref.apply(this, arguments);}return sendAction;}() }, { key: "run", value: function run(



    context, step, lastResult) {var _this = this;
      step = step.bind(this, context, lastResult);
      this.emit("beforeSequence", { context: context, sequence: step, lastResult: lastResult });
      return new _bluebird2.default(function (resolve, reject) {
        var done = function done(processed) {
          var result = resolve(processed);
          _this.emit("afterSequence", {
            context: context,
            sequence: step,
            lastResult: lastResult,
            result: result });

          return result;
        };

        var fail = function fail(err) {
          var result = reject(err);
          _this.emit("errorSequence", {
            context: context,
            sequence: step,
            lastResult: lastResult,
            result: result });

          return result;
        };

        try {
          var result;
          var processed = step();
          if (processed instanceof _bluebird2.default) {
            result = processed.then(done, fail);
          } else if (processed instanceof Error) {
            result = fail(processed);
          } else {
            result = done(processed);
          }
          return result;
        } catch (err) {
          return fail(err);
        }
      });
    } }, { key: "on", value: function on(

    eventName, observer) {
      var subscription = this.subject.
      filter(function (_ref2) {var name = _ref2.name;return name === eventName;}).
      map(function (_ref3) {var payload = _ref3.payload;return payload;}).
      subscribe(observer);
      this.observers.set(observer, subscription);
      return subscription;
    } }, { key: "emit", value: function emit(

    eventName, payload) {
      this.subject.next({ name: eventName, payload: payload });
      return this;
    } }, { key: "removeListener", value: function removeListener(

    eventName, observer) {
      this.observers.get(observer).unsubscribe();
      return this;
    } }]);return Worker;}();exports.default = Worker;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZlclxcV29ya2VyLmpzIl0sIm5hbWVzIjpbIldvcmtlciIsInNlcnZlciIsImNvbmZpZyIsInNvY2tldCIsImxvZ2dlciIsImRlZmF1bHRFcnJvckhhbmRsZXIiLCJzdWJqZWN0IiwiU3ViamVjdCIsIm9ic2VydmVycyIsIldlYWtNYXAiLCJwb3J0IiwiTnVtYmVyIiwiZ2V0IiwicHJvY2Vzc1RpbWVvdXQiLCJ3b3JrZXJUaW1lb3V0IiwiYWN0aW9uTmFtZSIsInBheWxvYWQiLCJ0aW1lb3V0Iiwic2VuZEFjdGlvbiIsImNvbnRleHQiLCJzdGVwIiwibGFzdFJlc3VsdCIsImJpbmQiLCJlbWl0Iiwic2VxdWVuY2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZG9uZSIsInJlc3VsdCIsInByb2Nlc3NlZCIsImZhaWwiLCJlcnIiLCJ0aGVuIiwiRXJyb3IiLCJldmVudE5hbWUiLCJvYnNlcnZlciIsInN1YnNjcmlwdGlvbiIsImZpbHRlciIsIm5hbWUiLCJtYXAiLCJzdWJzY3JpYmUiLCJzZXQiLCJuZXh0IiwidW5zdWJzY3JpYmUiXSwibWFwcGluZ3MiOiJ1c0JBQUEsNkI7O0FBRXFCQSxNO0FBQ25CLGtCQUFZQyxNQUFaLEVBQW9CQyxNQUFwQixFQUE0QkMsTUFBNUIsRUFBb0M7QUFDbEMsU0FBS0YsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsU0FBS0csTUFBTCxHQUFjSCxPQUFPRyxNQUFyQjtBQUNBLFNBQUtDLG1CQUFMLEdBQTZCSixPQUFPSSxtQkFBcEMsTUFBNkJKLE1BQTdCOztBQUVBLFNBQUtLLE9BQUwsR0FBZSxJQUFJLGFBQUdDLE9BQVAsRUFBZjtBQUNBLFNBQUtDLFNBQUwsR0FBaUIsSUFBSUMsT0FBSixFQUFqQjs7QUFFQSxTQUFLUCxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLQyxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLTyxJQUFMLEdBQVlDLE9BQU9ULE9BQU9VLEdBQVAsQ0FBVyx5QkFBWCxDQUFQLENBQVo7O0FBRUEsU0FBS0MsY0FBTCxHQUFzQkYsT0FBT1QsT0FBT1UsR0FBUCxDQUFXLDJCQUFYLENBQVAsQ0FBdEI7QUFDQSxTQUFLRSxhQUFMLEdBQXFCSCxPQUFPVCxPQUFPVSxHQUFQLENBQVcsMEJBQVgsQ0FBUCxDQUFyQjtBQUNELEc7O0FBRWdCRyxnQixFQUFZQyxPLEVBQVNDLE87QUFDdkIscUJBQUtoQixNQUFMLENBQVlpQixVQUFaO0FBQ1gscUJBQUtmLE1BRE07QUFFWFksMEJBRlc7QUFHWEMsdUJBSFc7QUFJWEMsdUJBSlcsQzs7OztBQVFYRSxXLEVBQVNDLEksRUFBTUMsVSxFQUFZO0FBQzdCRCxhQUFPQSxLQUFLRSxJQUFMLENBQVUsSUFBVixFQUFnQkgsT0FBaEIsRUFBeUJFLFVBQXpCLENBQVA7QUFDQSxXQUFLRSxJQUFMLENBQVUsZ0JBQVYsRUFBNEIsRUFBRUosZ0JBQUYsRUFBV0ssVUFBVUosSUFBckIsRUFBMkJDLHNCQUEzQixFQUE1QjtBQUNBLGFBQU8sdUJBQVksVUFBQ0ksT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3RDLFlBQU1DLE9BQU8sU0FBUEEsSUFBTyxZQUFhO0FBQ3hCLGNBQU1DLFNBQVNILFFBQVFJLFNBQVIsQ0FBZjtBQUNBLGdCQUFLTixJQUFMLENBQVUsZUFBVixFQUEyQjtBQUN6QkosNEJBRHlCO0FBRXpCSyxzQkFBVUosSUFGZTtBQUd6QkMsa0NBSHlCO0FBSXpCTywwQkFKeUIsRUFBM0I7O0FBTUEsaUJBQU9BLE1BQVA7QUFDRCxTQVREOztBQVdBLFlBQU1FLE9BQU8sU0FBUEEsSUFBTyxNQUFPO0FBQ2xCLGNBQU1GLFNBQVNGLE9BQU9LLEdBQVAsQ0FBZjtBQUNBLGdCQUFLUixJQUFMLENBQVUsZUFBVixFQUEyQjtBQUN6QkosNEJBRHlCO0FBRXpCSyxzQkFBVUosSUFGZTtBQUd6QkMsa0NBSHlCO0FBSXpCTywwQkFKeUIsRUFBM0I7O0FBTUEsaUJBQU9BLE1BQVA7QUFDRCxTQVREOztBQVdBLFlBQUk7QUFDRixjQUFJQSxNQUFKO0FBQ0EsY0FBTUMsWUFBWVQsTUFBbEI7QUFDQSxjQUFJUyx1Q0FBSixFQUFrQztBQUNoQ0QscUJBQVNDLFVBQVVHLElBQVYsQ0FBZUwsSUFBZixFQUFxQkcsSUFBckIsQ0FBVDtBQUNELFdBRkQsTUFFTyxJQUFJRCxxQkFBcUJJLEtBQXpCLEVBQWdDO0FBQ3JDTCxxQkFBU0UsS0FBS0QsU0FBTCxDQUFUO0FBQ0QsV0FGTSxNQUVBO0FBQ0xELHFCQUFTRCxLQUFLRSxTQUFMLENBQVQ7QUFDRDtBQUNELGlCQUFPRCxNQUFQO0FBQ0QsU0FYRCxDQVdFLE9BQU9HLEdBQVAsRUFBWTtBQUNaLGlCQUFPRCxLQUFLQyxHQUFMLENBQVA7QUFDRDtBQUNGLE9BckNNLENBQVA7QUFzQ0QsSzs7QUFFRUcsYSxFQUFXQyxRLEVBQVU7QUFDdEIsVUFBTUMsZUFBZSxLQUFLOUIsT0FBTDtBQUNsQitCLFlBRGtCLENBQ1gsc0JBQUdDLElBQUgsU0FBR0EsSUFBSCxRQUFjQSxTQUFTSixTQUF2QixFQURXO0FBRWxCSyxTQUZrQixDQUVkLHNCQUFHdkIsT0FBSCxTQUFHQSxPQUFILFFBQWlCQSxPQUFqQixFQUZjO0FBR2xCd0IsZUFIa0IsQ0FHUkwsUUFIUSxDQUFyQjtBQUlBLFdBQUszQixTQUFMLENBQWVpQyxHQUFmLENBQW1CTixRQUFuQixFQUE2QkMsWUFBN0I7QUFDQSxhQUFPQSxZQUFQO0FBQ0QsSzs7QUFFSUYsYSxFQUFXbEIsTyxFQUFTO0FBQ3ZCLFdBQUtWLE9BQUwsQ0FBYW9DLElBQWIsQ0FBa0IsRUFBRUosTUFBTUosU0FBUixFQUFtQmxCLGdCQUFuQixFQUFsQjtBQUNBLGFBQU8sSUFBUDtBQUNELEs7O0FBRWNrQixhLEVBQVdDLFEsRUFBVTtBQUNsQyxXQUFLM0IsU0FBTCxDQUFlSSxHQUFmLENBQW1CdUIsUUFBbkIsRUFBNkJRLFdBQTdCO0FBQ0EsYUFBTyxJQUFQO0FBQ0QsSyx5Q0F0RmtCM0MsTSIsImZpbGUiOiJzZXJ2ZXJcXFdvcmtlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSeCBmcm9tIFwicnhqcy9SeFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXb3JrZXIge1xuICBjb25zdHJ1Y3RvcihzZXJ2ZXIsIGNvbmZpZywgc29ja2V0KSB7XG4gICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgdGhpcy5sb2dnZXIgPSBzZXJ2ZXIubG9nZ2VyO1xuICAgIHRoaXMuZGVmYXVsdEVycm9ySGFuZGxlciA9IDo6c2VydmVyLmRlZmF1bHRFcnJvckhhbmRsZXI7XG5cbiAgICB0aGlzLnN1YmplY3QgPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIHRoaXMub2JzZXJ2ZXJzID0gbmV3IFdlYWtNYXAoKTtcblxuICAgIHRoaXMuY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMucG9ydCA9IE51bWJlcihjb25maWcuZ2V0KFwiQ29udHJvbGxlci5MaXN0ZW5lclBvcnRcIikpO1xuXG4gICAgdGhpcy5wcm9jZXNzVGltZW91dCA9IE51bWJlcihjb25maWcuZ2V0KFwiU2VydmVyLlByb2Nlc3NUaW1lb3V0SW5Nc1wiKSk7XG4gICAgdGhpcy53b3JrZXJUaW1lb3V0ID0gTnVtYmVyKGNvbmZpZy5nZXQoXCJTZXJ2ZXIuV29ya2VyVGltZW91dEluTXNcIikpO1xuICB9XG5cbiAgYXN5bmMgc2VuZEFjdGlvbihhY3Rpb25OYW1lLCBwYXlsb2FkLCB0aW1lb3V0KSB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc2VydmVyLnNlbmRBY3Rpb24oXG4gICAgICB0aGlzLnNvY2tldCxcbiAgICAgIGFjdGlvbk5hbWUsXG4gICAgICBwYXlsb2FkLFxuICAgICAgdGltZW91dFxuICAgICk7XG4gIH1cblxuICBydW4oY29udGV4dCwgc3RlcCwgbGFzdFJlc3VsdCkge1xuICAgIHN0ZXAgPSBzdGVwLmJpbmQodGhpcywgY29udGV4dCwgbGFzdFJlc3VsdCk7XG4gICAgdGhpcy5lbWl0KFwiYmVmb3JlU2VxdWVuY2VcIiwgeyBjb250ZXh0LCBzZXF1ZW5jZTogc3RlcCwgbGFzdFJlc3VsdCB9KTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgZG9uZSA9IHByb2Nlc3NlZCA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc29sdmUocHJvY2Vzc2VkKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiYWZ0ZXJTZXF1ZW5jZVwiLCB7XG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBzZXF1ZW5jZTogc3RlcCxcbiAgICAgICAgICBsYXN0UmVzdWx0LFxuICAgICAgICAgIHJlc3VsdFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGZhaWwgPSBlcnIgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSByZWplY3QoZXJyKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiZXJyb3JTZXF1ZW5jZVwiLCB7XG4gICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICBzZXF1ZW5jZTogc3RlcCxcbiAgICAgICAgICBsYXN0UmVzdWx0LFxuICAgICAgICAgIHJlc3VsdFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIGNvbnN0IHByb2Nlc3NlZCA9IHN0ZXAoKTtcbiAgICAgICAgaWYgKHByb2Nlc3NlZCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICByZXN1bHQgPSBwcm9jZXNzZWQudGhlbihkb25lLCBmYWlsKTtcbiAgICAgICAgfSBlbHNlIGlmIChwcm9jZXNzZWQgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgIHJlc3VsdCA9IGZhaWwocHJvY2Vzc2VkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQgPSBkb25lKHByb2Nlc3NlZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gZmFpbChlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgb24oZXZlbnROYW1lLCBvYnNlcnZlcikge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuc3ViamVjdFxuICAgICAgLmZpbHRlcigoeyBuYW1lIH0pID0+IG5hbWUgPT09IGV2ZW50TmFtZSlcbiAgICAgIC5tYXAoKHsgcGF5bG9hZCB9KSA9PiBwYXlsb2FkKVxuICAgICAgLnN1YnNjcmliZShvYnNlcnZlcik7XG4gICAgdGhpcy5vYnNlcnZlcnMuc2V0KG9ic2VydmVyLCBzdWJzY3JpcHRpb24pO1xuICAgIHJldHVybiBzdWJzY3JpcHRpb247XG4gIH1cblxuICBlbWl0KGV2ZW50TmFtZSwgcGF5bG9hZCkge1xuICAgIHRoaXMuc3ViamVjdC5uZXh0KHsgbmFtZTogZXZlbnROYW1lLCBwYXlsb2FkIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVtb3ZlTGlzdGVuZXIoZXZlbnROYW1lLCBvYnNlcnZlcikge1xuICAgIHRoaXMub2JzZXJ2ZXJzLmdldChvYnNlcnZlcikudW5zdWJzY3JpYmUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIl19