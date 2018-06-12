"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _bluebird = require("bluebird");var _bluebird2 = _interopRequireDefault(_bluebird);var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _shortid = require("shortid");var _shortid2 = _interopRequireDefault(_shortid);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

WorkerManager = function () {
  function WorkerManager(server, socket, worker) {_classCallCheck(this, WorkerManager);
    this.server = server;
    this.socket = socket;
    this.worker = worker;
    this.config = server.config;
    this.logger = server.logger;
    this.controller = server.controller;
    this.scenarioConfig = server.scenarioConfig;
    this.running = false;
  }_createClass(WorkerManager, [{ key: "createContext", value: function createContext()

    {var _this = this;
      var context = {
        id: _shortid2.default.generate(),
        config: this.config,
        server: this.server,
        socket: this.socket,
        worker: this.worker,
        logger: this.logger,
        controller: this.controller,
        scenarioConfig: this.scenarioConfig,
        manager: this,

        isRunning: function isRunning() {return _this.running;} };

      context.run = this.run.bind(this, context);
      context.process = this.process.bind(this, context);
      return context;
    } }, { key: "setPipeline", value: function setPipeline(

    pipeline) {
      this.pipeline = pipeline;
      return this;
    } }, { key: "start", value: function start()

    {var _this2 = this;
      var context;
      var stop = function stop(result) {
        context.result = result;
        _this2.emit("beforeStop", context);
        _this2.running = false;
        delete context.finish;
        delete context.error;
        _this2.emit("stop", context);
      };

      return new _bluebird2.default(function (resolve, reject) {
        if (_this2.running) {
          return reject(new Error("Manager already running"));
        }

        context = _this2.createContext();
        _this2.emit("beforeStart", context);
        _this2.running = true;
        _this2.resolveLater = context.finish = resolve;
        _this2.rejectLater = context.error = reject;
        _this2.emit("start", context);
      }).then(
      function (result) {
        stop(result);
        return result;
      },
      function (error) {
        stop(error);
        throw error;
      });

    } }, { key: "stop", value: function stop()

    {var _this3 = this;
      return new _bluebird2.default(function (resolve, reject) {
        if (!_this3.running) {
          return reject(new Error("Manager not running"));
        }

        _this3.running = false;
        return _this3.server.stopSocket(_this3.socket.id).then(resolve, reject);
      });
    } }, { key: "on", value: function on(

    eventName, observer) {
      return this.worker.on(eventName, observer);
    } }, { key: "emit", value: function emit(

    eventName, payload) {
      this.worker.emit(eventName, payload);
      return this;
    } }, { key: "removeListener", value: function removeListener(

    eventName, observer) {
      this.worker.removeListener(eventName, observer);
      return this;
    } }, { key: "process", value: function process(

    context, pipeline, lastResult, runner) {var _this4 = this;
      runner = runner || this.run.bind(this);
      return new _bluebird2.default(function (resolve, reject) {
        var step = pipeline.shift();
        if (!step || !context.isRunning()) {
          if (lastResult instanceof Error) {
            return reject(lastResult);
          } else {
            return resolve(lastResult);
          }
        }

        return runner(context, step, lastResult).
        then(function (result) {
          return _this4.process(context, pipeline, result, runner);
        }).
        then(resolve, reject);
      });
    } }, { key: "run", value: function run(

    context, step, lastResult) {var _this5 = this;
      return new _bluebird2.default(function (resolve, reject) {
        if (!context.isRunning()) {
          if (lastResult instanceof Error) {
            return reject(lastResult);
          } else {
            return resolve(lastResult);
          }
        }
        return _this5.worker.run(context, step, lastResult).then(resolve, reject);
      });
    } }, { key: "isRunning", value: function isRunning()

    {
      return this.running;
    } }]);return WorkerManager;}();exports.default = WorkerManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZlclxcV29ya2VyTWFuYWdlci5qcyJdLCJuYW1lcyI6WyJXb3JrZXJNYW5hZ2VyIiwic2VydmVyIiwic29ja2V0Iiwid29ya2VyIiwiY29uZmlnIiwibG9nZ2VyIiwiY29udHJvbGxlciIsInNjZW5hcmlvQ29uZmlnIiwicnVubmluZyIsImNvbnRleHQiLCJpZCIsImdlbmVyYXRlIiwibWFuYWdlciIsImlzUnVubmluZyIsInJ1biIsImJpbmQiLCJwcm9jZXNzIiwicGlwZWxpbmUiLCJzdG9wIiwicmVzdWx0IiwiZW1pdCIsImZpbmlzaCIsImVycm9yIiwicmVzb2x2ZSIsInJlamVjdCIsIkVycm9yIiwiY3JlYXRlQ29udGV4dCIsInJlc29sdmVMYXRlciIsInJlamVjdExhdGVyIiwidGhlbiIsInN0b3BTb2NrZXQiLCJldmVudE5hbWUiLCJvYnNlcnZlciIsIm9uIiwicGF5bG9hZCIsInJlbW92ZUxpc3RlbmVyIiwibGFzdFJlc3VsdCIsInJ1bm5lciIsInN0ZXAiLCJzaGlmdCJdLCJtYXBwaW5ncyI6InVzQkFBQSxrQzs7QUFFcUJBLGE7QUFDbkIseUJBQVlDLE1BQVosRUFBb0JDLE1BQXBCLEVBQTRCQyxNQUE1QixFQUFvQztBQUNsQyxTQUFLRixNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLQyxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLQyxNQUFMLEdBQWNBLE1BQWQ7QUFDQSxTQUFLQyxNQUFMLEdBQWNILE9BQU9HLE1BQXJCO0FBQ0EsU0FBS0MsTUFBTCxHQUFjSixPQUFPSSxNQUFyQjtBQUNBLFNBQUtDLFVBQUwsR0FBa0JMLE9BQU9LLFVBQXpCO0FBQ0EsU0FBS0MsY0FBTCxHQUFzQk4sT0FBT00sY0FBN0I7QUFDQSxTQUFLQyxPQUFMLEdBQWUsS0FBZjtBQUNELEc7O0FBRWU7QUFDZCxVQUFNQyxVQUFVO0FBQ2RDLFlBQUksa0JBQVFDLFFBQVIsRUFEVTtBQUVkUCxnQkFBUSxLQUFLQSxNQUZDO0FBR2RILGdCQUFRLEtBQUtBLE1BSEM7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QUtoQixPQUFaO0FBQ0QsSyxnREFsSWtCUixhIiwiZmlsZSI6InNlcnZlclxcV29ya2VyTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzaG9ydGlkIGZyb20gXCJzaG9ydGlkXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdvcmtlck1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihzZXJ2ZXIsIHNvY2tldCwgd29ya2VyKSB7XG4gICAgdGhpcy5zZXJ2ZXIgPSBzZXJ2ZXI7XG4gICAgdGhpcy5zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy53b3JrZXIgPSB3b3JrZXI7XG4gICAgdGhpcy5jb25maWcgPSBzZXJ2ZXIuY29uZmlnO1xuICAgIHRoaXMubG9nZ2VyID0gc2VydmVyLmxvZ2dlcjtcbiAgICB0aGlzLmNvbnRyb2xsZXIgPSBzZXJ2ZXIuY29udHJvbGxlcjtcbiAgICB0aGlzLnNjZW5hcmlvQ29uZmlnID0gc2VydmVyLnNjZW5hcmlvQ29uZmlnO1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICB9XG5cbiAgY3JlYXRlQ29udGV4dCgpIHtcbiAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgaWQ6IHNob3J0aWQuZ2VuZXJhdGUoKSxcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBzZXJ2ZXI6IHRoaXMuc2VydmVyLFxuICAgICAgc29ja2V0OiB0aGlzLnNvY2tldCxcbiAgICAgIHdvcmtlcjogdGhpcy53b3JrZXIsXG4gICAgICBsb2dnZXI6IHRoaXMubG9nZ2VyLFxuICAgICAgY29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuICAgICAgc2NlbmFyaW9Db25maWc6IHRoaXMuc2NlbmFyaW9Db25maWcsXG4gICAgICBtYW5hZ2VyOiB0aGlzLFxuXG4gICAgICBpc1J1bm5pbmc6ICgpID0+IHRoaXMucnVubmluZ1xuICAgIH07XG4gICAgY29udGV4dC5ydW4gPSB0aGlzLnJ1bi5iaW5kKHRoaXMsIGNvbnRleHQpO1xuICAgIGNvbnRleHQucHJvY2VzcyA9IHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMsIGNvbnRleHQpO1xuICAgIHJldHVybiBjb250ZXh0O1xuICB9XG5cbiAgc2V0UGlwZWxpbmUocGlwZWxpbmUpIHtcbiAgICB0aGlzLnBpcGVsaW5lID0gcGlwZWxpbmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB2YXIgY29udGV4dDtcbiAgICBjb25zdCBzdG9wID0gcmVzdWx0ID0+IHtcbiAgICAgIGNvbnRleHQucmVzdWx0ID0gcmVzdWx0O1xuICAgICAgdGhpcy5lbWl0KFwiYmVmb3JlU3RvcFwiLCBjb250ZXh0KTtcbiAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgZGVsZXRlIGNvbnRleHQuZmluaXNoO1xuICAgICAgZGVsZXRlIGNvbnRleHQuZXJyb3I7XG4gICAgICB0aGlzLmVtaXQoXCJzdG9wXCIsIGNvbnRleHQpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihcIk1hbmFnZXIgYWxyZWFkeSBydW5uaW5nXCIpKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dCA9IHRoaXMuY3JlYXRlQ29udGV4dCgpO1xuICAgICAgdGhpcy5lbWl0KFwiYmVmb3JlU3RhcnRcIiwgY29udGV4dCk7XG4gICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgdGhpcy5yZXNvbHZlTGF0ZXIgPSBjb250ZXh0LmZpbmlzaCA9IHJlc29sdmU7XG4gICAgICB0aGlzLnJlamVjdExhdGVyID0gY29udGV4dC5lcnJvciA9IHJlamVjdDtcbiAgICAgIHRoaXMuZW1pdChcInN0YXJ0XCIsIGNvbnRleHQpO1xuICAgIH0pLnRoZW4oXG4gICAgICByZXN1bHQgPT4ge1xuICAgICAgICBzdG9wKHJlc3VsdCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LFxuICAgICAgZXJyb3IgPT4ge1xuICAgICAgICBzdG9wKGVycm9yKTtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICghdGhpcy5ydW5uaW5nKSB7XG4gICAgICAgIHJldHVybiByZWplY3QobmV3IEVycm9yKFwiTWFuYWdlciBub3QgcnVubmluZ1wiKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXMuc2VydmVyLnN0b3BTb2NrZXQodGhpcy5zb2NrZXQuaWQpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIG9uKGV2ZW50TmFtZSwgb2JzZXJ2ZXIpIHtcbiAgICByZXR1cm4gdGhpcy53b3JrZXIub24oZXZlbnROYW1lLCBvYnNlcnZlcik7XG4gIH1cblxuICBlbWl0KGV2ZW50TmFtZSwgcGF5bG9hZCkge1xuICAgIHRoaXMud29ya2VyLmVtaXQoZXZlbnROYW1lLCBwYXlsb2FkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJlbW92ZUxpc3RlbmVyKGV2ZW50TmFtZSwgb2JzZXJ2ZXIpIHtcbiAgICB0aGlzLndvcmtlci5yZW1vdmVMaXN0ZW5lcihldmVudE5hbWUsIG9ic2VydmVyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByb2Nlc3MoY29udGV4dCwgcGlwZWxpbmUsIGxhc3RSZXN1bHQsIHJ1bm5lcikge1xuICAgIHJ1bm5lciA9IHJ1bm5lciB8fCA6OnRoaXMucnVuO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzdGVwID0gcGlwZWxpbmUuc2hpZnQoKTtcbiAgICAgIGlmICghc3RlcCB8fCAhY29udGV4dC5pc1J1bm5pbmcoKSkge1xuICAgICAgICBpZiAobGFzdFJlc3VsdCBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChsYXN0UmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShsYXN0UmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcnVubmVyKGNvbnRleHQsIHN0ZXAsIGxhc3RSZXN1bHQpXG4gICAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzcyhjb250ZXh0LCBwaXBlbGluZSwgcmVzdWx0LCBydW5uZXIpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pO1xuICB9XG5cbiAgcnVuKGNvbnRleHQsIHN0ZXAsIGxhc3RSZXN1bHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKCFjb250ZXh0LmlzUnVubmluZygpKSB7XG4gICAgICAgIGlmIChsYXN0UmVzdWx0IGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGxhc3RSZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKGxhc3RSZXN1bHQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy53b3JrZXIucnVuKGNvbnRleHQsIHN0ZXAsIGxhc3RSZXN1bHQpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGlzUnVubmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5ydW5uaW5nO1xuICB9XG59XG4iXX0=