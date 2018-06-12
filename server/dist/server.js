"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _bluebird = require("bluebird");var _bluebird2 = _interopRequireDefault(_bluebird);var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();





// awesome stuff














// core extension
var _http = require("http");var _http2 = _interopRequireDefault(_http);var _shortid = require("shortid");var _shortid2 = _interopRequireDefault(_shortid);var _socket = require("socket.io");var _socket2 = _interopRequireDefault(_socket);var _express = require("express");var _express2 = _interopRequireDefault(_express);var _bodyParser = require("body-parser");var _bodyParser2 = _interopRequireDefault(_bodyParser);var _Rx = require("rxjs/Rx");var _Rx2 = _interopRequireDefault(_Rx);var _immutable = require("immutable");var Immutable = _interopRequireWildcard(_immutable);var _isObject = require("lodash/isObject");var _isObject2 = _interopRequireDefault(_isObject);var _forEach = require("lodash/forEach");var _forEach2 = _interopRequireDefault(_forEach);var _noop = require("lodash/noop");var _noop2 = _interopRequireDefault(_noop);var _Worker = require("./server/Worker");var _Worker2 = _interopRequireDefault(_Worker);var _WorkerManager = require("./server/WorkerManager");var _WorkerManager2 = _interopRequireDefault(_WorkerManager);var _Logger = require("./lib/Logger");var _Logger2 = _interopRequireDefault(_Logger);var _JsonRpcServer = require("./lib/JsonRpcServer");var _JsonRpcServer2 = _interopRequireDefault(_JsonRpcServer);var _JsonRpcClient = require("./lib/JsonRpcClient");var _JsonRpcClient2 = _interopRequireDefault(_JsonRpcClient);var _ConfigWrapper = require("./lib/ConfigWrapper");var _ConfigWrapper2 = _interopRequireDefault(_ConfigWrapper);var _gbfAutopilotCore = require("gbf-autopilot-core");var _gbfAutopilotCore2 = _interopRequireDefault(_gbfAutopilotCore);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

Server = function () {
  function Server(options, readOptions) {var _this = this;_classCallCheck(this, Server);
    this.options = options;
    this.refreshOptions(options);

    this.readOptions = readOptions;
    this.subject = new _Rx2.default.Subject();

    // extension stuff
    this.coreExtension = _gbfAutopilotCore2.default.server.call(this);
    this.extensions = this.loadExtensions(options.extensionNames);

    // controller stuff
    this.controller = new _JsonRpcClient2.default(this.controllerPort);

    // JSON-RPC stuff
    this.methods = {
      start: function start() {
        _this.logger.debug("Got start request from webhook");
        return _this.start().then(function () {return "OK";});
      },
      stop: function stop() {
        _this.logger.debug("Got stop request from webhook");
        return _this.stop().then(function () {return "OK";});
      },
      sockets: function sockets() {
        return Object.keys(_this.sockets).join(", ");
      } };


    this.setupListeners();
    this.setupStates();
    this.setupApps();
  }_createClass(Server, [{ key: "loadExtensions", value: function loadExtensions(

    extensionNames) {var _this2 = this;
      var extensions = {};
      (0, _forEach2.default)(extensionNames, function (extensionName) {
        var extension = require(extensionName);
        if (!extension.server) return;
        extensions[extensionName] = extension.server.call(_this2, _this2);
      });
      return extensions;
    } }, { key: "refreshOptions", value: function refreshOptions(

    options) {
      this.rootDir = options.rootDir;
      this.refreshScenarioConfig(options.scenarioConfig);
      this.refreshConfig(options.config);
    } }, { key: "refreshOptionsAsync", value: function refreshOptionsAsync(

    options) {var _this3 = this;
      return new _bluebird2.default(function (resolve, reject) {
        if (options) {
          _this3.refreshOptions(options);
          resolve(options);
        } else {
          _this3.readOptions().then(function (options) {
            _this3.refreshOptions(options);
            resolve(options);
          }, reject);
        }
      });
    } }, { key: "refreshScenarioConfig", value: function refreshScenarioConfig(

    scenarioConfig) {
      this.scenarioConfig = new _ConfigWrapper2.default(scenarioConfig);
    } }, { key: "refreshConfig", value: function refreshConfig(

    config) {
      config = new _ConfigWrapper2.default(config);
      this.config = config;
      this.logger = (0, _Logger2.default)(config);
      this.port = process.env.PORT || Number(config.get("Server.ListenerPort"));
      this.controllerPort = Number(config.get("Controller.ListenerPort"));
      this.timeout = Number(config.get("Server.ProcessTimeoutInMs"));
    } }, { key: "setupListeners", value: function setupListeners()

    {
      this.listeners = {
        start: this.onSocketStart.bind(this),
        stop: this.onSocketStop.bind(this),
        action: this.onActionSuccess.bind(this),
        "action.fail": this.onActionFail.bind(this),
        broadcast: this.onBroadcast.bind(this),
        disconnect: this.onDisconnect.bind(this) };

    } }, { key: "setupStates", value: function setupStates()

    {
      this.sockets = {};
      this.running = false;
      this.lastConnectedSocket = null;
    } }, { key: "setupApps", value: function setupApps()

    {
      this.app = (0, _express2.default)();
      this.server = _http2.default.Server(this.app);
      this.io = (0, _socket2.default)(this.server);

      this.setupExpress(this.app);
      this.setupSocket(this.io);
      this.setupJsonRpc();
    } }, { key: "setupJsonRpc", value: function setupJsonRpc()

    {
      this.jsonRpc = new _JsonRpcServer2.default(
      this.app,
      this.methods,
      this.config.get("Server.JsonRpcEndpoint"));

    } }, { key: "setupExpress", value: function setupExpress(

    app) {var _this4 = this;
      var defaultResponse = function defaultResponse(res, promise) {
        promise.then(
        function () {
          res.end("OK");
        },
        function (err) {
          _this4.defaultErrorHandler(err);
          res.status(500);
          res.end(err.toString());
        });

      };

      this.emit("express.beforeSetup", app);

      app.use(_bodyParser2.default.text());
      app.use(_bodyParser2.default.json());
      app.post("/start", function (req, res) {
        defaultResponse(res, _this4.methods.start());
      });
      app.post("/stop", function (req, res) {
        defaultResponse(res, _this4.methods.stop());
      });
      app.get("/sockets", function (req, res) {
        res.end(_this4.methods.sockets());
      });

      this.emit("express.afterSetup", app);
    } }, { key: "setupSocket", value: function setupSocket(

    io) {var _this5 = this;
      this.emit("socket.beforeSetup", io);

      io.on("connection", function (socket) {
        (0, _forEach2.default)(_this5.listeners, function (listener, name) {
          socket.on(name, function (msg) {return listener(socket, msg);});
        });
        _this5.onConnect(socket);
      });

      this.emit("socket.afterSetup", io);
    }

    /**
       * Make request to the controller server
       * @param {string} method
       * @param {object|array} params
       * @returns {Promise}
       */ }, { key: "makeRequest", value: function makeRequest(
    method, params) {
      this.emit(
      "controller.request",
      { method: "POST", path: method, data: params },
      true);

      // return axios.post(`http://localhost:${this.controllerPort}/${path}`, data);
      this.emit("controller.jsonrpc.request", { method: method, params: params }, true);
      return this.controller.request(method, params ? [params] : null);
    } }, { key: "onConnect", value: function onConnect(

    socket) {
      this.emit("socket.connect", socket);
      this.logger.debug("Client '" + socket.id + "' connected!");
      this.lastConnectedSocket = socket;
    } }, { key: "onDisconnect", value: function onDisconnect(

    socket) {
      this.emit("socket.disconnect", socket);
      this.logger.debug("Client '" + socket.id + "' disconnected!");
      if (this.running) {
        this.stop().then(_noop2.default, this.defaultErrorHandler.bind(this));
      }
    } }, { key: "onSocketStart", value: function onSocketStart(

    socket) {var _this6 = this;
      if (this.running) return;
      this.emit("socket.socketStart", socket);
      this.logger.debug("Socket '" + socket.id + "' started");

      this.refreshOptionsAsync().then(function () {
        var botTimeout =
        Number(_this6.config.get("General.TimeLimitInSeconds")) * 1000;
        var worker = new _Worker2.default(_this6, _this6.config, socket);
        var manager = new _WorkerManager2.default(_this6, socket, worker);
        var context = manager.context;

        var errorHandler = function errorHandler(error) {
          _this6.emit("worker.error", { context: context, error: error });
          _this6.defaultErrorHandler(error);
          _this6.stop().then(_noop2.default, _this6.defaultErrorHandler.bind(_this6));
        };

        var timer = setTimeout(function () {
          if (!_this6.sockets[socket.id]) return;
          var error = new Error("Bot timed out!");
          _this6.emit("worker.timeout", { context: context, error: error });
          _this6.logger.debug("Bot reaches maximum time. Disconnecting...");
          errorHandler(error);
        }, botTimeout);

        _this6.sockets[socket.id] = {
          socket: socket,
          worker: worker,
          timer: timer,
          manager: manager,
          actions: {} };


        var workerEvents = [
        "beforeStart",
        "start",
        "beforeSequence",
        "afterSequence",
        "finish",
        "afterFinish",
        "beforeStop",
        "stop",
        "afterStop"];

        (0, _forEach2.default)(workerEvents, function (eventName) {
          worker.on(eventName, function (payload) {
            _this6.emit("worker." + eventName, payload);
          });
        });

        _this6.controller.
        start().
        then(function () {
          _this6.running = true;
          _this6.logger.info("Autopilot started.");
          return manager.start();
        }).
        then(function () {
          return _this6.stop();
        }).
        then(_noop2.default, errorHandler);
      }, this.defaultErrorHandler.bind(this));
    } }, { key: "onSocketStop", value: function onSocketStop(

    socket) {
      if (!this.running) return;
      this.emit("socket.socketStop", socket);
      this.logger.debug("Got stop request from socket '" + socket.id + "'");
      this.stop().then(_noop2.default, this.defaultErrorHandler.bind(this));
    } }, { key: "onBroadcast", value: function onBroadcast(

    socket, data) {
      this.emit(
      "socket.broadcast",
      {
        id: data.id,
        name: data.action,
        payload: data.payload,
        socket: socket,
        data: data },

      true);

    } }, { key: "onAction", value: function onAction(

    socket, data, callback) {
      var action = this.getAction(socket, data.id);
      // silently fail
      if (!action) return;
      this.emit(
      "socket.action",
      {
        id: data.id,
        action: action,
        payload: data.payload,
        socket: socket,
        data: data },

      true);

      callback(action, data.payload);
      action.complete(data.payload);
      clearTimeout(action.timer);
    } }, { key: "onActionSuccess", value: function onActionSuccess(

    socket, data) {var _this7 = this;
      this.onAction(socket, data, function (action, payload) {
        _this7.emit(
        "socket.actionSuccess",
        { id: data.id, action: action, payload: payload, socket: socket, data: data },
        true);

        action.success(payload);
      });
    } }, { key: "onActionFail", value: function onActionFail(

    socket, data) {var _this8 = this;
      this.onAction(socket, data, function (action, payload) {
        _this8.emit(
        "socket.actionFail",
        { id: data.id, action: action, payload: payload, socket: socket, data: data },
        true);

        action.fail(payload);
      });
    } }, { key: "getAction", value: function getAction(

    socket, id) {
      socket = this.sockets[socket.id];
      return socket ? socket.actions[id] : null;
    } }, { key: "sendAction", value: function sendAction(

    realSocket, actionName, payload, timeout) {var _this9 = this;
      timeout = !(0, _isObject2.default)(timeout) ?
      {
        stopOnTimeout: true,
        timeoutInMs: timeout } :

      timeout;
      timeout.timeoutInMs = timeout.timeoutInMs || this.timeout;

      return new _bluebird2.default(function (resolve, reject) {
        var resolved = false;
        var id = _shortid2.default.generate();
        var json = JSON.stringify(payload);
        var expression = actionName + "(" + json + ")";
        var socket = _this9.sockets[realSocket.id];
        if (!socket) {
          reject(new Error("Socket not found!"));
          return;
        }

        var eventData = {
          id: id,
          socket: realSocket,
          action: actionName,
          payload: payload,
          timeout: timeout };

        _this9.emit("socket.beforeSendAction", eventData, true);

        var actions = socket.actions;
        var done = function done() {
          resolved = true;
          clearTimeout(actions[id].timer);
          delete actions[id];
        };

        actions[id] = {
          success: function success(payload) {
            eventData.payload = payload;
            _this9.emit("socket.successSendAction", eventData, true);
            resolve(payload);
            done();
          },
          fail: function fail(payload) {
            eventData.payload = payload;
            _this9.emit("socket.failSendAction", eventData, true);
            reject(payload);
            done();
          },
          timer:
          timeout.timeoutInMs > 0 ?
          setTimeout(function () {
            if (resolved) {
              done();
              return;
            }

            var error = eventData.error = new Error("Action " +
            expression + " timed out after " +
            timeout.timeoutInMs + "ms!");


            _this9.emit("socket.timeoutSendAction", eventData, true);
            reject(error);
          }, timeout.timeoutInMs) :
          0,
          complete: function complete(payload) {
            eventData.payload = payload;
            _this9.emit("socket.afterSendAction", eventData, true);
          } };


        var data = {
          id: id,
          payload: payload,
          timeout: timeout.timeoutInMs,
          action: actionName,
          type: "request" };


        eventData.data = data;
        _this9.emit("socket.sendAction", eventData, true);
        realSocket.emit("action", data);
      });
    } }, { key: "stopSocket", value: function stopSocket(

    id) {var _this10 = this;
      return new _bluebird2.default(function (resolve, reject) {
        if (!_this10.sockets[id]) {
          reject(new Error("Socket not found!"));
          return;
        }
        _this10.logger.debug("Stopping socket '" + id + "'");var _sockets$id =
        _this10.sockets[id],socket = _sockets$id.socket,timer = _sockets$id.timer,actions = _sockets$id.actions;
        delete _this10.sockets[id];
        (0, _forEach2.default)(actions, function (action) {
          clearTimeout(action.timer);
        });
        clearTimeout(timer);
        socket.emit("stop");
        setTimeout(resolve, 1);
      });
    } }, { key: "listen", value: function listen()

    {var _this11 = this;
      this.emit("server.beforeListening");
      return new _bluebird2.default(function (resolve) {
        _this11.server.listen(_this11.port, "localhost", function () {
          _this11.emit("server.onListening");
          _this11.logger.debug("Started listening on localhost:" + _this11.port);
          resolve({
            app: _this11,
            server: _this11.server });

        });
      });
    } }, { key: "start", value: function start()

    {var _this12 = this;
      return new _bluebird2.default(function (resolve, reject) {
        if (_this12.running) {
          _this12.logger.debug("Autopilot is already running");
          return resolve();
        }
        if (!_this12.lastConnectedSocket || !_this12.lastConnectedSocket.connected) {
          return reject(new Error("No connected sockets"));
        }
        _this12.emit("server.beforeStart", _this12.lastConnectedSocket);
        _this12.lastConnectedSocket.emit("start");
        _this12.onSocketStart(_this12.lastConnectedSocket);
        _this12.emit("server.onStart", _this12.lastConnectedSocket);
        return resolve();
      });
    } }, { key: "stop", value: function stop()

    {var _this13 = this;
      return new _bluebird2.default(function (resolve, reject) {
        if (!_this13.running) {
          _this13.logger.debug("Autopilot is not running!");
          return resolve();
        }
        var handleSocket = function handleSocket(cb) {
          var socketId = Object.keys(_this13.sockets).pop();
          if (!socketId) {
            _this13.controller.stop().then(cb, _this13.defaultErrorHandler.bind(_this13));
            return;
          }

          var socket = _this13.sockets[socketId];
          if (socket.manager.running) {
            socket.manager.stop().then(function () {
              handleSocket(cb);
            }, reject);
          } else {
            _this13.stopSocket(socketId).then(function () {
              handleSocket(cb);
            }, reject);
          }
        };
        _this13.emit("server.beforeStop");
        handleSocket(function () {
          _this13.running = false;
          _this13.sockets = {};
          _this13.emit("server.stop");
          _this13.logger.info("Autopilot stopped.");
          resolve();
        });
      });
    } }, { key: "defaultErrorHandler", value: function defaultErrorHandler(

    err) {
      this.emit("server.error", err);
      err = err || new Error("Unknown error occured");
      if (this.config.get("Debug.ThrowErrors")) {
        throw err;
      }
      this.logger.error(err instanceof Error ? err : err.toString());
    } }, { key: "emit", value: function emit(

    eventName, payload, immutable) {
      payload = payload || {};
      if (!(0, _isObject2.default)(payload)) {
        payload = { data: payload };
      }
      payload["$eventName"] = eventName;
      if (immutable) {
        // Make the payload immutable when needed
        payload = Immutable.Map(payload);
      }
      this.subject.next(payload);
    } }, { key: "getObservable", value: function getObservable(

    eventName) {
      return this.subject.
      map(function (payload) {
        // We don't expect the observers to handle Immutable.js object though
        // So we convert them back to plain JS object
        return payload && payload.toJS ? payload.toJS() : payload;
      }).
      filter(function (payload) {
        return payload["$eventName"] === eventName;
      }).
      map(function (payload) {
        delete payload["$eventName"];
        return payload;
      });
    } }, { key: "on", value: function on(

    eventName, observer, onError, onComplete) {
      return this.getObservable(eventName).subscribe(
      observer,
      onError || this.defaultErrorHandler.bind(this),
      onComplete);

    } }]);return Server;}();exports.default = Server;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZlci5qcyJdLCJuYW1lcyI6WyJJbW11dGFibGUiLCJTZXJ2ZXIiLCJvcHRpb25zIiwicmVhZE9wdGlvbnMiLCJyZWZyZXNoT3B0aW9ucyIsInN1YmplY3QiLCJTdWJqZWN0IiwiY29yZUV4dGVuc2lvbiIsInNlcnZlciIsImNhbGwiLCJleHRlbnNpb25zIiwibG9hZEV4dGVuc2lvbnMiLCJleHRlbnNpb25OYW1lcyIsImNvbnRyb2xsZXIiLCJjb250cm9sbGVyUG9ydCIsIm1ldGhvZHMiLCJzdGFydCIsImxvZ2dlciIsImRlYnVnIiwidGhlbiIsInN0b3AiLCJzb2NrZXRzIiwiT2JqZWN0Iiwia2V5cyIsImpvaW4iLCJzZXR1cExpc3RlbmVycyIsInNldHVwU3RhdGVzIiwic2V0dXBBcHBzIiwiZXh0ZW5zaW9uIiwicmVxdWlyZSIsImV4dGVuc2lvbk5hbWUiLCJyb290RGlyIiwicmVmcmVzaFNjZW5hcmlvQ29uZmlnIiwic2NlbmFyaW9Db25maWciLCJyZWZyZXNoQ29uZmlnIiwiY29uZmlnIiwicmVzb2x2ZSIsInJlamVjdCIsInBvcnQiLCJwcm9jZXNzIiwiZW52IiwiUE9SVCIsIk51bWJlciIsImdldCIsInRpbWVvdXQiLCJsaXN0ZW5lcnMiLCJvblNvY2tldFN0YXJ0Iiwib25Tb2NrZXRTdG9wIiwiYWN0aW9uIiwib25BY3Rpb25TdWNjZXNzIiwib25BY3Rpb25GYWlsIiwiYnJvYWRjYXN0Iiwib25Ccm9hZGNhc3QiLCJkaXNjb25uZWN0Iiwib25EaXNjb25uZWN0IiwicnVubmluZyIsImxhc3RDb25uZWN0ZWRTb2NrZXQiLCJhcHAiLCJpbyIsInNldHVwRXhwcmVzcyIsInNldHVwU29ja2V0Iiwic2V0dXBKc29uUnBjIiwianNvblJwYyIsImRlZmF1bHRSZXNwb25zZSIsInJlcyIsInByb21pc2UiLCJlbmQiLCJkZWZhdWx0RXJyb3JIYW5kbGVyIiwiZXJyIiwic3RhdHVzIiwidG9TdHJpbmciLCJlbWl0IiwidXNlIiwidGV4dCIsImpzb24iLCJwb3N0IiwicmVxIiwib24iLCJsaXN0ZW5lciIsIm5hbWUiLCJzb2NrZXQiLCJtc2ciLCJvbkNvbm5lY3QiLCJtZXRob2QiLCJwYXJhbXMiLCJwYXRoIiwiZGF0YSIsInJlcXVlc3QiLCJpZCIsInJlZnJlc2hPcHRpb25zQXN5bmMiLCJib3RUaW1lb3V0Iiwid29ya2VyIiwibWFuYWdlciIsImNvbnRleHQiLCJlcnJvckhhbmRsZXIiLCJlcnJvciIsInRpbWVyIiwic2V0VGltZW91dCIsIkVycm9yIiwiYWN0aW9ucyIsIndvcmtlckV2ZW50cyIsImV2ZW50TmFtZSIsInBheWxvYWQiLCJpbmZvIiwiY2FsbGJhY2siLCJnZXRBY3Rpb24iLCJjb21wbGV0ZSIsImNsZWFyVGltZW91dCIsIm9uQWN0aW9uIiwic3VjY2VzcyIsImZhaWwiLCJyZWFsU29ja2V0IiwiYWN0aW9uTmFtZSIsInN0b3BPblRpbWVvdXQiLCJ0aW1lb3V0SW5NcyIsInJlc29sdmVkIiwiZ2VuZXJhdGUiLCJKU09OIiwic3RyaW5naWZ5IiwiZXhwcmVzc2lvbiIsImV2ZW50RGF0YSIsImRvbmUiLCJ0eXBlIiwibGlzdGVuIiwiY29ubmVjdGVkIiwiaGFuZGxlU29ja2V0Iiwic29ja2V0SWQiLCJwb3AiLCJjYiIsInN0b3BTb2NrZXQiLCJpbW11dGFibGUiLCJNYXAiLCJuZXh0IiwibWFwIiwidG9KUyIsImZpbHRlciIsIm9ic2VydmVyIiwib25FcnJvciIsIm9uQ29tcGxldGUiLCJnZXRPYnNlcnZhYmxlIiwic3Vic2NyaWJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFNQTs7Ozs7Ozs7Ozs7Ozs7O0FBZUE7QUFyQkEsNEIsMkNBQ0Esa0MsaURBQ0EsbUMsK0NBQ0Esa0MsaURBQ0EseUMsdURBR0EsNkIsdUNBQ0Esc0MsSUFBWUEsUyx1Q0FFWiwyQyxtREFDQSx5QyxpREFDQSxtQywyQ0FFQSx5QywrQ0FDQSx1RCw2REFDQSxzQywrQ0FDQSxvRCw2REFDQSxvRCw2REFDQSxvRCw2REFHQSxzRDs7QUFFcUJDLE07QUFDbkIsa0JBQVlD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IGZyb20gXCJodHRwXCI7XG5pbXBvcnQgc2hvcnRpZCBmcm9tIFwic2hvcnRpZFwiO1xuaW1wb3J0IFNvY2tldElPIGZyb20gXCJzb2NrZXQuaW9cIjtcbmltcG9ydCBFeHByZXNzIGZyb20gXCJleHByZXNzXCI7XG5pbXBvcnQgYm9keVBhcnNlciBmcm9tIFwiYm9keS1wYXJzZXJcIjtcblxuLy8gYXdlc29tZSBzdHVmZlxuaW1wb3J0IFJ4IGZyb20gXCJyeGpzL1J4XCI7XG5pbXBvcnQgKiBhcyBJbW11dGFibGUgZnJvbSBcImltbXV0YWJsZVwiO1xuXG5pbXBvcnQgaXNPYmplY3QgZnJvbSBcImxvZGFzaC9pc09iamVjdFwiO1xuaW1wb3J0IGZvckVhY2ggZnJvbSBcImxvZGFzaC9mb3JFYWNoXCI7XG5pbXBvcnQgbm9vcCBmcm9tIFwibG9kYXNoL25vb3BcIjtcblxuaW1wb3J0IFdvcmtlciBmcm9tIFwiLi9zZXJ2ZXIvV29ya2VyXCI7XG5pbXBvcnQgV29ya2VyTWFuYWdlciBmcm9tIFwiLi9zZXJ2ZXIvV29ya2VyTWFuYWdlclwiO1xuaW1wb3J0IExvZ2dlciBmcm9tIFwiLi9saWIvTG9nZ2VyXCI7XG5pbXBvcnQgSnNvblJwY1NlcnZlciBmcm9tIFwiLi9saWIvSnNvblJwY1NlcnZlclwiO1xuaW1wb3J0IEpzb25ScGNDbGllbnQgZnJvbSBcIi4vbGliL0pzb25ScGNDbGllbnRcIjtcbmltcG9ydCBDb25maWdXcmFwcGVyIGZyb20gXCIuL2xpYi9Db25maWdXcmFwcGVyXCI7XG5cbi8vIGNvcmUgZXh0ZW5zaW9uXG5pbXBvcnQgY29yZUV4dGVuc2lvbiBmcm9tIFwiZ2JmLWF1dG9waWxvdC1jb3JlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMsIHJlYWRPcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLnJlZnJlc2hPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgdGhpcy5yZWFkT3B0aW9ucyA9IHJlYWRPcHRpb25zO1xuICAgIHRoaXMuc3ViamVjdCA9IG5ldyBSeC5TdWJqZWN0KCk7XG5cbiAgICAvLyBleHRlbnNpb24gc3R1ZmZcbiAgICB0aGlzLmNvcmVFeHRlbnNpb24gPSBjb3JlRXh0ZW5zaW9uLnNlcnZlci5jYWxsKHRoaXMpO1xuICAgIHRoaXMuZXh0ZW5zaW9ucyA9IHRoaXMubG9hZEV4dGVuc2lvbnMob3B0aW9ucy5leHRlbnNpb25OYW1lcyk7XG5cbiAgICAvLyBjb250cm9sbGVyIHN0dWZmXG4gICAgdGhpcy5jb250cm9sbGVyID0gbmV3IEpzb25ScGNDbGllbnQodGhpcy5jb250cm9sbGVyUG9ydCk7XG5cbiAgICAvLyBKU09OLVJQQyBzdHVmZlxuICAgIHRoaXMubWV0aG9kcyA9IHtcbiAgICAgIHN0YXJ0OiAoKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKFwiR290IHN0YXJ0IHJlcXVlc3QgZnJvbSB3ZWJob29rXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydCgpLnRoZW4oKCkgPT4gXCJPS1wiKTtcbiAgICAgIH0sXG4gICAgICBzdG9wOiAoKSA9PiB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKFwiR290IHN0b3AgcmVxdWVzdCBmcm9tIHdlYmhvb2tcIik7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3AoKS50aGVuKCgpID0+IFwiT0tcIik7XG4gICAgICB9LFxuICAgICAgc29ja2V0czogKCkgPT4ge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5zb2NrZXRzKS5qb2luKFwiLCBcIik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuc2V0dXBMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLnNldHVwU3RhdGVzKCk7XG4gICAgdGhpcy5zZXR1cEFwcHMoKTtcbiAgfVxuXG4gIGxvYWRFeHRlbnNpb25zKGV4dGVuc2lvbk5hbWVzKSB7XG4gICAgY29uc3QgZXh0ZW5zaW9ucyA9IHt9O1xuICAgIGZvckVhY2goZXh0ZW5zaW9uTmFtZXMsIGV4dGVuc2lvbk5hbWUgPT4ge1xuICAgICAgY29uc3QgZXh0ZW5zaW9uID0gcmVxdWlyZShleHRlbnNpb25OYW1lKTtcbiAgICAgIGlmICghZXh0ZW5zaW9uLnNlcnZlcikgcmV0dXJuO1xuICAgICAgZXh0ZW5zaW9uc1tleHRlbnNpb25OYW1lXSA9IGV4dGVuc2lvbi5zZXJ2ZXIuY2FsbCh0aGlzLCB0aGlzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZXh0ZW5zaW9ucztcbiAgfVxuXG4gIHJlZnJlc2hPcHRpb25zKG9wdGlvbnMpIHtcbiAgICB0aGlzLnJvb3REaXIgPSBvcHRpb25zLnJvb3REaXI7XG4gICAgdGhpcy5yZWZyZXNoU2NlbmFyaW9Db25maWcob3B0aW9ucy5zY2VuYXJpb0NvbmZpZyk7XG4gICAgdGhpcy5yZWZyZXNoQ29uZmlnKG9wdGlvbnMuY29uZmlnKTtcbiAgfVxuXG4gIHJlZnJlc2hPcHRpb25zQXN5bmMob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICB0aGlzLnJlZnJlc2hPcHRpb25zKG9wdGlvbnMpO1xuICAgICAgICByZXNvbHZlKG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWFkT3B0aW9ucygpLnRoZW4ob3B0aW9ucyA9PiB7XG4gICAgICAgICAgdGhpcy5yZWZyZXNoT3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgICByZXNvbHZlKG9wdGlvbnMpO1xuICAgICAgICB9LCByZWplY3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVmcmVzaFNjZW5hcmlvQ29uZmlnKHNjZW5hcmlvQ29uZmlnKSB7XG4gICAgdGhpcy5zY2VuYXJpb0NvbmZpZyA9IG5ldyBDb25maWdXcmFwcGVyKHNjZW5hcmlvQ29uZmlnKTtcbiAgfVxuXG4gIHJlZnJlc2hDb25maWcoY29uZmlnKSB7XG4gICAgY29uZmlnID0gbmV3IENvbmZpZ1dyYXBwZXIoY29uZmlnKTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmxvZ2dlciA9IExvZ2dlcihjb25maWcpO1xuICAgIHRoaXMucG9ydCA9IHByb2Nlc3MuZW52LlBPUlQgfHwgTnVtYmVyKGNvbmZpZy5nZXQoXCJTZXJ2ZXIuTGlzdGVuZXJQb3J0XCIpKTtcbiAgICB0aGlzLmNvbnRyb2xsZXJQb3J0ID0gTnVtYmVyKGNvbmZpZy5nZXQoXCJDb250cm9sbGVyLkxpc3RlbmVyUG9ydFwiKSk7XG4gICAgdGhpcy50aW1lb3V0ID0gTnVtYmVyKGNvbmZpZy5nZXQoXCJTZXJ2ZXIuUHJvY2Vzc1RpbWVvdXRJbk1zXCIpKTtcbiAgfVxuXG4gIHNldHVwTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubGlzdGVuZXJzID0ge1xuICAgICAgc3RhcnQ6IDo6dGhpcy5vblNvY2tldFN0YXJ0LFxuICAgICAgc3RvcDogOjp0aGlzLm9uU29ja2V0U3RvcCxcbiAgICAgIGFjdGlvbjogOjp0aGlzLm9uQWN0aW9uU3VjY2VzcyxcbiAgICAgIFwiYWN0aW9uLmZhaWxcIjogOjp0aGlzLm9uQWN0aW9uRmFpbCxcbiAgICAgIGJyb2FkY2FzdDogOjp0aGlzLm9uQnJvYWRjYXN0LFxuICAgICAgZGlzY29ubmVjdDogOjp0aGlzLm9uRGlzY29ubmVjdFxuICAgIH07XG4gIH1cblxuICBzZXR1cFN0YXRlcygpIHtcbiAgICB0aGlzLnNvY2tldHMgPSB7fTtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICB0aGlzLmxhc3RDb25uZWN0ZWRTb2NrZXQgPSBudWxsO1xuICB9XG5cbiAgc2V0dXBBcHBzKCkge1xuICAgIHRoaXMuYXBwID0gRXhwcmVzcygpO1xuICAgIHRoaXMuc2VydmVyID0gaHR0cC5TZXJ2ZXIodGhpcy5hcHApO1xuICAgIHRoaXMuaW8gPSBTb2NrZXRJTyh0aGlzLnNlcnZlcik7XG5cbiAgICB0aGlzLnNldHVwRXhwcmVzcyh0aGlzLmFwcCk7XG4gICAgdGhpcy5zZXR1cFNvY2tldCh0aGlzLmlvKTtcbiAgICB0aGlzLnNldHVwSnNvblJwYygpO1xuICB9XG5cbiAgc2V0dXBKc29uUnBjKCkge1xuICAgIHRoaXMuanNvblJwYyA9IG5ldyBKc29uUnBjU2VydmVyKFxuICAgICAgdGhpcy5hcHAsXG4gICAgICB0aGlzLm1ldGhvZHMsXG4gICAgICB0aGlzLmNvbmZpZy5nZXQoXCJTZXJ2ZXIuSnNvblJwY0VuZHBvaW50XCIpXG4gICAgKTtcbiAgfVxuXG4gIHNldHVwRXhwcmVzcyhhcHApIHtcbiAgICBjb25zdCBkZWZhdWx0UmVzcG9uc2UgPSAocmVzLCBwcm9taXNlKSA9PiB7XG4gICAgICBwcm9taXNlLnRoZW4oXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICByZXMuZW5kKFwiT0tcIik7XG4gICAgICAgIH0sXG4gICAgICAgIGVyciA9PiB7XG4gICAgICAgICAgdGhpcy5kZWZhdWx0RXJyb3JIYW5kbGVyKGVycik7XG4gICAgICAgICAgcmVzLnN0YXR1cyg1MDApO1xuICAgICAgICAgIHJlcy5lbmQoZXJyLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG5cbiAgICB0aGlzLmVtaXQoXCJleHByZXNzLmJlZm9yZVNldHVwXCIsIGFwcCk7XG5cbiAgICBhcHAudXNlKGJvZHlQYXJzZXIudGV4dCgpKTtcbiAgICBhcHAudXNlKGJvZHlQYXJzZXIuanNvbigpKTtcbiAgICBhcHAucG9zdChcIi9zdGFydFwiLCAocmVxLCByZXMpID0+IHtcbiAgICAgIGRlZmF1bHRSZXNwb25zZShyZXMsIHRoaXMubWV0aG9kcy5zdGFydCgpKTtcbiAgICB9KTtcbiAgICBhcHAucG9zdChcIi9zdG9wXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgZGVmYXVsdFJlc3BvbnNlKHJlcywgdGhpcy5tZXRob2RzLnN0b3AoKSk7XG4gICAgfSk7XG4gICAgYXBwLmdldChcIi9zb2NrZXRzXCIsIChyZXEsIHJlcykgPT4ge1xuICAgICAgcmVzLmVuZCh0aGlzLm1ldGhvZHMuc29ja2V0cygpKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZW1pdChcImV4cHJlc3MuYWZ0ZXJTZXR1cFwiLCBhcHApO1xuICB9XG5cbiAgc2V0dXBTb2NrZXQoaW8pIHtcbiAgICB0aGlzLmVtaXQoXCJzb2NrZXQuYmVmb3JlU2V0dXBcIiwgaW8pO1xuXG4gICAgaW8ub24oXCJjb25uZWN0aW9uXCIsIHNvY2tldCA9PiB7XG4gICAgICBmb3JFYWNoKHRoaXMubGlzdGVuZXJzLCAobGlzdGVuZXIsIG5hbWUpID0+IHtcbiAgICAgICAgc29ja2V0Lm9uKG5hbWUsIG1zZyA9PiBsaXN0ZW5lcihzb2NrZXQsIG1zZykpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLm9uQ29ubmVjdChzb2NrZXQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lbWl0KFwic29ja2V0LmFmdGVyU2V0dXBcIiwgaW8pO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2UgcmVxdWVzdCB0byB0aGUgY29udHJvbGxlciBzZXJ2ZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZFxuICAgKiBAcGFyYW0ge29iamVjdHxhcnJheX0gcGFyYW1zXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgbWFrZVJlcXVlc3QobWV0aG9kLCBwYXJhbXMpIHtcbiAgICB0aGlzLmVtaXQoXG4gICAgICBcImNvbnRyb2xsZXIucmVxdWVzdFwiLFxuICAgICAgeyBtZXRob2Q6IFwiUE9TVFwiLCBwYXRoOiBtZXRob2QsIGRhdGE6IHBhcmFtcyB9LFxuICAgICAgdHJ1ZVxuICAgICk7XG4gICAgLy8gcmV0dXJuIGF4aW9zLnBvc3QoYGh0dHA6Ly9sb2NhbGhvc3Q6JHt0aGlzLmNvbnRyb2xsZXJQb3J0fS8ke3BhdGh9YCwgZGF0YSk7XG4gICAgdGhpcy5lbWl0KFwiY29udHJvbGxlci5qc29ucnBjLnJlcXVlc3RcIiwgeyBtZXRob2QsIHBhcmFtcyB9LCB0cnVlKTtcbiAgICByZXR1cm4gdGhpcy5jb250cm9sbGVyLnJlcXVlc3QobWV0aG9kLCBwYXJhbXMgPyBbcGFyYW1zXSA6IG51bGwpO1xuICB9XG5cbiAgb25Db25uZWN0KHNvY2tldCkge1xuICAgIHRoaXMuZW1pdChcInNvY2tldC5jb25uZWN0XCIsIHNvY2tldCk7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoYENsaWVudCAnJHtzb2NrZXQuaWR9JyBjb25uZWN0ZWQhYCk7XG4gICAgdGhpcy5sYXN0Q29ubmVjdGVkU29ja2V0ID0gc29ja2V0O1xuICB9XG5cbiAgb25EaXNjb25uZWN0KHNvY2tldCkge1xuICAgIHRoaXMuZW1pdChcInNvY2tldC5kaXNjb25uZWN0XCIsIHNvY2tldCk7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoYENsaWVudCAnJHtzb2NrZXQuaWR9JyBkaXNjb25uZWN0ZWQhYCk7XG4gICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgdGhpcy5zdG9wKCkudGhlbihub29wLCA6OnRoaXMuZGVmYXVsdEVycm9ySGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgb25Tb2NrZXRTdGFydChzb2NrZXQpIHtcbiAgICBpZiAodGhpcy5ydW5uaW5nKSByZXR1cm47XG4gICAgdGhpcy5lbWl0KFwic29ja2V0LnNvY2tldFN0YXJ0XCIsIHNvY2tldCk7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoXCJTb2NrZXQgJ1wiICsgc29ja2V0LmlkICsgXCInIHN0YXJ0ZWRcIik7XG5cbiAgICB0aGlzLnJlZnJlc2hPcHRpb25zQXN5bmMoKS50aGVuKCgpID0+IHtcbiAgICAgIGNvbnN0IGJvdFRpbWVvdXQgPVxuICAgICAgICBOdW1iZXIodGhpcy5jb25maWcuZ2V0KFwiR2VuZXJhbC5UaW1lTGltaXRJblNlY29uZHNcIikpICogMTAwMDtcbiAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIodGhpcywgdGhpcy5jb25maWcsIHNvY2tldCk7XG4gICAgICBjb25zdCBtYW5hZ2VyID0gbmV3IFdvcmtlck1hbmFnZXIodGhpcywgc29ja2V0LCB3b3JrZXIpO1xuICAgICAgY29uc3QgY29udGV4dCA9IG1hbmFnZXIuY29udGV4dDtcblxuICAgICAgY29uc3QgZXJyb3JIYW5kbGVyID0gZXJyb3IgPT4ge1xuICAgICAgICB0aGlzLmVtaXQoXCJ3b3JrZXIuZXJyb3JcIiwgeyBjb250ZXh0LCBlcnJvciB9KTtcbiAgICAgICAgdGhpcy5kZWZhdWx0RXJyb3JIYW5kbGVyKGVycm9yKTtcbiAgICAgICAgdGhpcy5zdG9wKCkudGhlbihub29wLCA6OnRoaXMuZGVmYXVsdEVycm9ySGFuZGxlcik7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc29ja2V0c1tzb2NrZXQuaWRdKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKFwiQm90IHRpbWVkIG91dCFcIik7XG4gICAgICAgIHRoaXMuZW1pdChcIndvcmtlci50aW1lb3V0XCIsIHsgY29udGV4dCwgZXJyb3IgfSk7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKFwiQm90IHJlYWNoZXMgbWF4aW11bSB0aW1lLiBEaXNjb25uZWN0aW5nLi4uXCIpO1xuICAgICAgICBlcnJvckhhbmRsZXIoZXJyb3IpO1xuICAgICAgfSwgYm90VGltZW91dCk7XG5cbiAgICAgIHRoaXMuc29ja2V0c1tzb2NrZXQuaWRdID0ge1xuICAgICAgICBzb2NrZXQsXG4gICAgICAgIHdvcmtlcixcbiAgICAgICAgdGltZXIsXG4gICAgICAgIG1hbmFnZXIsXG4gICAgICAgIGFjdGlvbnM6IHt9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCB3b3JrZXJFdmVudHMgPSBbXG4gICAgICAgIFwiYmVmb3JlU3RhcnRcIixcbiAgICAgICAgXCJzdGFydFwiLFxuICAgICAgICBcImJlZm9yZVNlcXVlbmNlXCIsXG4gICAgICAgIFwiYWZ0ZXJTZXF1ZW5jZVwiLFxuICAgICAgICBcImZpbmlzaFwiLFxuICAgICAgICBcImFmdGVyRmluaXNoXCIsXG4gICAgICAgIFwiYmVmb3JlU3RvcFwiLFxuICAgICAgICBcInN0b3BcIixcbiAgICAgICAgXCJhZnRlclN0b3BcIlxuICAgICAgXTtcbiAgICAgIGZvckVhY2god29ya2VyRXZlbnRzLCBldmVudE5hbWUgPT4ge1xuICAgICAgICB3b3JrZXIub24oZXZlbnROYW1lLCBwYXlsb2FkID0+IHtcbiAgICAgICAgICB0aGlzLmVtaXQoXCJ3b3JrZXIuXCIgKyBldmVudE5hbWUsIHBheWxvYWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmNvbnRyb2xsZXJcbiAgICAgICAgLnN0YXJ0KClcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgICAgICAgdGhpcy5sb2dnZXIuaW5mbyhcIkF1dG9waWxvdCBzdGFydGVkLlwiKTtcbiAgICAgICAgICByZXR1cm4gbWFuYWdlci5zdGFydCgpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcCgpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihub29wLCBlcnJvckhhbmRsZXIpO1xuICAgIH0sIDo6dGhpcy5kZWZhdWx0RXJyb3JIYW5kbGVyKTtcbiAgfVxuXG4gIG9uU29ja2V0U3RvcChzb2NrZXQpIHtcbiAgICBpZiAoIXRoaXMucnVubmluZykgcmV0dXJuO1xuICAgIHRoaXMuZW1pdChcInNvY2tldC5zb2NrZXRTdG9wXCIsIHNvY2tldCk7XG4gICAgdGhpcy5sb2dnZXIuZGVidWcoXCJHb3Qgc3RvcCByZXF1ZXN0IGZyb20gc29ja2V0ICdcIiArIHNvY2tldC5pZCArIFwiJ1wiKTtcbiAgICB0aGlzLnN0b3AoKS50aGVuKG5vb3AsIDo6dGhpcy5kZWZhdWx0RXJyb3JIYW5kbGVyKTtcbiAgfVxuXG4gIG9uQnJvYWRjYXN0KHNvY2tldCwgZGF0YSkge1xuICAgIHRoaXMuZW1pdChcbiAgICAgIFwic29ja2V0LmJyb2FkY2FzdFwiLFxuICAgICAge1xuICAgICAgICBpZDogZGF0YS5pZCxcbiAgICAgICAgbmFtZTogZGF0YS5hY3Rpb24sXG4gICAgICAgIHBheWxvYWQ6IGRhdGEucGF5bG9hZCxcbiAgICAgICAgc29ja2V0LFxuICAgICAgICBkYXRhXG4gICAgICB9LFxuICAgICAgdHJ1ZVxuICAgICk7XG4gIH1cblxuICBvbkFjdGlvbihzb2NrZXQsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgYWN0aW9uID0gdGhpcy5nZXRBY3Rpb24oc29ja2V0LCBkYXRhLmlkKTtcbiAgICAvLyBzaWxlbnRseSBmYWlsXG4gICAgaWYgKCFhY3Rpb24pIHJldHVybjtcbiAgICB0aGlzLmVtaXQoXG4gICAgICBcInNvY2tldC5hY3Rpb25cIixcbiAgICAgIHtcbiAgICAgICAgaWQ6IGRhdGEuaWQsXG4gICAgICAgIGFjdGlvbixcbiAgICAgICAgcGF5bG9hZDogZGF0YS5wYXlsb2FkLFxuICAgICAgICBzb2NrZXQsXG4gICAgICAgIGRhdGFcbiAgICAgIH0sXG4gICAgICB0cnVlXG4gICAgKTtcbiAgICBjYWxsYmFjayhhY3Rpb24sIGRhdGEucGF5bG9hZCk7XG4gICAgYWN0aW9uLmNvbXBsZXRlKGRhdGEucGF5bG9hZCk7XG4gICAgY2xlYXJUaW1lb3V0KGFjdGlvbi50aW1lcik7XG4gIH1cblxuICBvbkFjdGlvblN1Y2Nlc3Moc29ja2V0LCBkYXRhKSB7XG4gICAgdGhpcy5vbkFjdGlvbihzb2NrZXQsIGRhdGEsIChhY3Rpb24sIHBheWxvYWQpID0+IHtcbiAgICAgIHRoaXMuZW1pdChcbiAgICAgICAgXCJzb2NrZXQuYWN0aW9uU3VjY2Vzc1wiLFxuICAgICAgICB7IGlkOiBkYXRhLmlkLCBhY3Rpb24sIHBheWxvYWQsIHNvY2tldCwgZGF0YSB9LFxuICAgICAgICB0cnVlXG4gICAgICApO1xuICAgICAgYWN0aW9uLnN1Y2Nlc3MocGF5bG9hZCk7XG4gICAgfSk7XG4gIH1cblxuICBvbkFjdGlvbkZhaWwoc29ja2V0LCBkYXRhKSB7XG4gICAgdGhpcy5vbkFjdGlvbihzb2NrZXQsIGRhdGEsIChhY3Rpb24sIHBheWxvYWQpID0+IHtcbiAgICAgIHRoaXMuZW1pdChcbiAgICAgICAgXCJzb2NrZXQuYWN0aW9uRmFpbFwiLFxuICAgICAgICB7IGlkOiBkYXRhLmlkLCBhY3Rpb24sIHBheWxvYWQsIHNvY2tldCwgZGF0YSB9LFxuICAgICAgICB0cnVlXG4gICAgICApO1xuICAgICAgYWN0aW9uLmZhaWwocGF5bG9hZCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRBY3Rpb24oc29ja2V0LCBpZCkge1xuICAgIHNvY2tldCA9IHRoaXMuc29ja2V0c1tzb2NrZXQuaWRdO1xuICAgIHJldHVybiBzb2NrZXQgPyBzb2NrZXQuYWN0aW9uc1tpZF0gOiBudWxsO1xuICB9XG5cbiAgc2VuZEFjdGlvbihyZWFsU29ja2V0LCBhY3Rpb25OYW1lLCBwYXlsb2FkLCB0aW1lb3V0KSB7XG4gICAgdGltZW91dCA9ICFpc09iamVjdCh0aW1lb3V0KVxuICAgICAgPyB7XG4gICAgICAgIHN0b3BPblRpbWVvdXQ6IHRydWUsXG4gICAgICAgIHRpbWVvdXRJbk1zOiB0aW1lb3V0XG4gICAgICB9XG4gICAgICA6IHRpbWVvdXQ7XG4gICAgdGltZW91dC50aW1lb3V0SW5NcyA9IHRpbWVvdXQudGltZW91dEluTXMgfHwgdGhpcy50aW1lb3V0O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZhciByZXNvbHZlZCA9IGZhbHNlO1xuICAgICAgY29uc3QgaWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG4gICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkocGF5bG9hZCk7XG4gICAgICBjb25zdCBleHByZXNzaW9uID0gYCR7YWN0aW9uTmFtZX0oJHtqc29ufSlgO1xuICAgICAgY29uc3Qgc29ja2V0ID0gdGhpcy5zb2NrZXRzW3JlYWxTb2NrZXQuaWRdO1xuICAgICAgaWYgKCFzb2NrZXQpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlNvY2tldCBub3QgZm91bmQhXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBldmVudERhdGEgPSB7XG4gICAgICAgIGlkLFxuICAgICAgICBzb2NrZXQ6IHJlYWxTb2NrZXQsXG4gICAgICAgIGFjdGlvbjogYWN0aW9uTmFtZSxcbiAgICAgICAgcGF5bG9hZCxcbiAgICAgICAgdGltZW91dFxuICAgICAgfTtcbiAgICAgIHRoaXMuZW1pdChcInNvY2tldC5iZWZvcmVTZW5kQWN0aW9uXCIsIGV2ZW50RGF0YSwgdHJ1ZSk7XG5cbiAgICAgIGNvbnN0IGFjdGlvbnMgPSBzb2NrZXQuYWN0aW9ucztcbiAgICAgIGNvbnN0IGRvbmUgPSAoKSA9PiB7XG4gICAgICAgIHJlc29sdmVkID0gdHJ1ZTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGFjdGlvbnNbaWRdLnRpbWVyKTtcbiAgICAgICAgZGVsZXRlIGFjdGlvbnNbaWRdO1xuICAgICAgfTtcblxuICAgICAgYWN0aW9uc1tpZF0gPSB7XG4gICAgICAgIHN1Y2Nlc3M6IHBheWxvYWQgPT4ge1xuICAgICAgICAgIGV2ZW50RGF0YS5wYXlsb2FkID0gcGF5bG9hZDtcbiAgICAgICAgICB0aGlzLmVtaXQoXCJzb2NrZXQuc3VjY2Vzc1NlbmRBY3Rpb25cIiwgZXZlbnREYXRhLCB0cnVlKTtcbiAgICAgICAgICByZXNvbHZlKHBheWxvYWQpO1xuICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmFpbDogcGF5bG9hZCA9PiB7XG4gICAgICAgICAgZXZlbnREYXRhLnBheWxvYWQgPSBwYXlsb2FkO1xuICAgICAgICAgIHRoaXMuZW1pdChcInNvY2tldC5mYWlsU2VuZEFjdGlvblwiLCBldmVudERhdGEsIHRydWUpO1xuICAgICAgICAgIHJlamVjdChwYXlsb2FkKTtcbiAgICAgICAgICBkb25lKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHRpbWVyOlxuICAgICAgICAgIHRpbWVvdXQudGltZW91dEluTXMgPiAwXG4gICAgICAgICAgICA/IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgZXJyb3IgPSAoZXZlbnREYXRhLmVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBBY3Rpb24gJHtleHByZXNzaW9ufSB0aW1lZCBvdXQgYWZ0ZXIgJHtcbiAgICAgICAgICAgICAgICAgIHRpbWVvdXQudGltZW91dEluTXNcbiAgICAgICAgICAgICAgICB9bXMhYFxuICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgdGhpcy5lbWl0KFwic29ja2V0LnRpbWVvdXRTZW5kQWN0aW9uXCIsIGV2ZW50RGF0YSwgdHJ1ZSk7XG4gICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9LCB0aW1lb3V0LnRpbWVvdXRJbk1zKVxuICAgICAgICAgICAgOiAwLFxuICAgICAgICBjb21wbGV0ZTogcGF5bG9hZCA9PiB7XG4gICAgICAgICAgZXZlbnREYXRhLnBheWxvYWQgPSBwYXlsb2FkO1xuICAgICAgICAgIHRoaXMuZW1pdChcInNvY2tldC5hZnRlclNlbmRBY3Rpb25cIiwgZXZlbnREYXRhLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgaWQsXG4gICAgICAgIHBheWxvYWQsXG4gICAgICAgIHRpbWVvdXQ6IHRpbWVvdXQudGltZW91dEluTXMsXG4gICAgICAgIGFjdGlvbjogYWN0aW9uTmFtZSxcbiAgICAgICAgdHlwZTogXCJyZXF1ZXN0XCJcbiAgICAgIH07XG5cbiAgICAgIGV2ZW50RGF0YS5kYXRhID0gZGF0YTtcbiAgICAgIHRoaXMuZW1pdChcInNvY2tldC5zZW5kQWN0aW9uXCIsIGV2ZW50RGF0YSwgdHJ1ZSk7XG4gICAgICByZWFsU29ja2V0LmVtaXQoXCJhY3Rpb25cIiwgZGF0YSk7XG4gICAgfSk7XG4gIH1cblxuICBzdG9wU29ja2V0KGlkKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICghdGhpcy5zb2NrZXRzW2lkXSkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKFwiU29ja2V0IG5vdCBmb3VuZCFcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmxvZ2dlci5kZWJ1ZyhcIlN0b3BwaW5nIHNvY2tldCAnXCIgKyBpZCArIFwiJ1wiKTtcbiAgICAgIGNvbnN0IHsgc29ja2V0LCB0aW1lciwgYWN0aW9ucyB9ID0gdGhpcy5zb2NrZXRzW2lkXTtcbiAgICAgIGRlbGV0ZSB0aGlzLnNvY2tldHNbaWRdO1xuICAgICAgZm9yRWFjaChhY3Rpb25zLCBhY3Rpb24gPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQoYWN0aW9uLnRpbWVyKTtcbiAgICAgIH0pO1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIHNvY2tldC5lbWl0KFwic3RvcFwiKTtcbiAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgMSk7XG4gICAgfSk7XG4gIH1cblxuICBsaXN0ZW4oKSB7XG4gICAgdGhpcy5lbWl0KFwic2VydmVyLmJlZm9yZUxpc3RlbmluZ1wiKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICB0aGlzLnNlcnZlci5saXN0ZW4odGhpcy5wb3J0LCBcImxvY2FsaG9zdFwiLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdChcInNlcnZlci5vbkxpc3RlbmluZ1wiKTtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoXCJTdGFydGVkIGxpc3RlbmluZyBvbiBsb2NhbGhvc3Q6XCIgKyB0aGlzLnBvcnQpO1xuICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICBhcHA6IHRoaXMsXG4gICAgICAgICAgc2VydmVyOiB0aGlzLnNlcnZlclxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoXCJBdXRvcGlsb3QgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmxhc3RDb25uZWN0ZWRTb2NrZXQgfHwgIXRoaXMubGFzdENvbm5lY3RlZFNvY2tldC5jb25uZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoXCJObyBjb25uZWN0ZWQgc29ja2V0c1wiKSk7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoXCJzZXJ2ZXIuYmVmb3JlU3RhcnRcIiwgdGhpcy5sYXN0Q29ubmVjdGVkU29ja2V0KTtcbiAgICAgIHRoaXMubGFzdENvbm5lY3RlZFNvY2tldC5lbWl0KFwic3RhcnRcIik7XG4gICAgICB0aGlzLm9uU29ja2V0U3RhcnQodGhpcy5sYXN0Q29ubmVjdGVkU29ja2V0KTtcbiAgICAgIHRoaXMuZW1pdChcInNlcnZlci5vblN0YXJ0XCIsIHRoaXMubGFzdENvbm5lY3RlZFNvY2tldCk7XG4gICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZGVidWcoXCJBdXRvcGlsb3QgaXMgbm90IHJ1bm5pbmchXCIpO1xuICAgICAgICByZXR1cm4gcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgICAgY29uc3QgaGFuZGxlU29ja2V0ID0gY2IgPT4ge1xuICAgICAgICBjb25zdCBzb2NrZXRJZCA9IE9iamVjdC5rZXlzKHRoaXMuc29ja2V0cykucG9wKCk7XG4gICAgICAgIGlmICghc29ja2V0SWQpIHtcbiAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIuc3RvcCgpLnRoZW4oY2IsIDo6dGhpcy5kZWZhdWx0RXJyb3JIYW5kbGVyKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzb2NrZXQgPSB0aGlzLnNvY2tldHNbc29ja2V0SWRdO1xuICAgICAgICBpZiAoc29ja2V0Lm1hbmFnZXIucnVubmluZykge1xuICAgICAgICAgIHNvY2tldC5tYW5hZ2VyLnN0b3AoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGhhbmRsZVNvY2tldChjYik7XG4gICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnN0b3BTb2NrZXQoc29ja2V0SWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgaGFuZGxlU29ja2V0KGNiKTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGhpcy5lbWl0KFwic2VydmVyLmJlZm9yZVN0b3BcIik7XG4gICAgICBoYW5kbGVTb2NrZXQoKCkgPT4ge1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zb2NrZXRzID0ge307XG4gICAgICAgIHRoaXMuZW1pdChcInNlcnZlci5zdG9wXCIpO1xuICAgICAgICB0aGlzLmxvZ2dlci5pbmZvKFwiQXV0b3BpbG90IHN0b3BwZWQuXCIpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlZmF1bHRFcnJvckhhbmRsZXIoZXJyKSB7XG4gICAgdGhpcy5lbWl0KFwic2VydmVyLmVycm9yXCIsIGVycik7XG4gICAgZXJyID0gZXJyIHx8IG5ldyBFcnJvcihcIlVua25vd24gZXJyb3Igb2NjdXJlZFwiKTtcbiAgICBpZiAodGhpcy5jb25maWcuZ2V0KFwiRGVidWcuVGhyb3dFcnJvcnNcIikpIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgdGhpcy5sb2dnZXIuZXJyb3IoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIgOiBlcnIudG9TdHJpbmcoKSk7XG4gIH1cblxuICBlbWl0KGV2ZW50TmFtZSwgcGF5bG9hZCwgaW1tdXRhYmxlKSB7XG4gICAgcGF5bG9hZCA9IHBheWxvYWQgfHwge307XG4gICAgaWYgKCFpc09iamVjdChwYXlsb2FkKSkge1xuICAgICAgcGF5bG9hZCA9IHsgZGF0YTogcGF5bG9hZCB9O1xuICAgIH1cbiAgICBwYXlsb2FkW1wiJGV2ZW50TmFtZVwiXSA9IGV2ZW50TmFtZTtcbiAgICBpZiAoaW1tdXRhYmxlKSB7XG4gICAgICAvLyBNYWtlIHRoZSBwYXlsb2FkIGltbXV0YWJsZSB3aGVuIG5lZWRlZFxuICAgICAgcGF5bG9hZCA9IEltbXV0YWJsZS5NYXAocGF5bG9hZCk7XG4gICAgfVxuICAgIHRoaXMuc3ViamVjdC5uZXh0KHBheWxvYWQpO1xuICB9XG5cbiAgZ2V0T2JzZXJ2YWJsZShldmVudE5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJqZWN0XG4gICAgICAubWFwKHBheWxvYWQgPT4ge1xuICAgICAgICAvLyBXZSBkb24ndCBleHBlY3QgdGhlIG9ic2VydmVycyB0byBoYW5kbGUgSW1tdXRhYmxlLmpzIG9iamVjdCB0aG91Z2hcbiAgICAgICAgLy8gU28gd2UgY29udmVydCB0aGVtIGJhY2sgdG8gcGxhaW4gSlMgb2JqZWN0XG4gICAgICAgIHJldHVybiBwYXlsb2FkICYmIHBheWxvYWQudG9KUyA/IHBheWxvYWQudG9KUygpIDogcGF5bG9hZDtcbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKHBheWxvYWQgPT4ge1xuICAgICAgICByZXR1cm4gcGF5bG9hZFtcIiRldmVudE5hbWVcIl0gPT09IGV2ZW50TmFtZTtcbiAgICAgIH0pXG4gICAgICAubWFwKHBheWxvYWQgPT4ge1xuICAgICAgICBkZWxldGUgcGF5bG9hZFtcIiRldmVudE5hbWVcIl07XG4gICAgICAgIHJldHVybiBwYXlsb2FkO1xuICAgICAgfSk7XG4gIH1cblxuICBvbihldmVudE5hbWUsIG9ic2VydmVyLCBvbkVycm9yLCBvbkNvbXBsZXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0T2JzZXJ2YWJsZShldmVudE5hbWUpLnN1YnNjcmliZShcbiAgICAgIG9ic2VydmVyLFxuICAgICAgb25FcnJvciB8fCA6OnRoaXMuZGVmYXVsdEVycm9ySGFuZGxlcixcbiAgICAgIG9uQ29tcGxldGVcbiAgICApO1xuICB9XG59XG4iXX0=