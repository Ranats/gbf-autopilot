import http from "http";
import axios from "axios";
import shortid from "shortid";
import SocketIO from "socket.io";
import Express from "express";
import bodyParser from "body-parser";

// awesome stuff
import Rx from "rxjs/Rx";
import * as Immutable from "immutable";

import isObject from "lodash/isObject";
import forEach from "lodash/forEach";
import noop from "lodash/noop";

import Worker from "./server/Worker";
import WorkerManager from "./server/WorkerManager";
import Logger from "./lib/Logger";

// core extension
import coreExtension from "gbf-autopilot-core";

export default class Server {
  constructor(options, readOptions) {
    this.options = options;
    this.readOptions = readOptions;
    this.subject = new Rx.Subject();

    this.config = options.config;
    this.rootDir = options.rootDir;
    this.logger = Logger(this.config);
    this.port = process.env.PORT || Number(options.config.Server.ListenerPort);

    // extension stuff
    this.coreExtension = coreExtension.server.call(this);
    this.extensions = this.loadExtensions(options.extensionNames);

    this.refreshOptions(options);
    this.setupListeners();
    this.setupStates();
    this.setupApps();
  }

  loadExtensions(extensionNames) {
    const extensions = {};
    forEach(extensionNames, (extensionName) => {
      const extension = require(extensionName);
      if (!extension.server) return;
      extensions[extensionName] = extension.server.call(this);
    });
    return extensions;
  }

  refreshOptions(options) {
    this.refreshConfig(options.config);
  }

  refreshOptionsAsync(options) {
    return new Promise((resolve, reject) => {
      if (options) {
        this.refreshOptions(options);
        resolve(options);
      } else {
        this.readOptions().then((options) => {
          this.refreshOptions(options);
          resolve(options);
        }, reject);
      }
    });
  }

  refreshConfig(config) {
    this.config = config;
    this.controllerPort = Number(config.Controller.ListenerPort);
    this.timeout = Number(config.Server.ProcessTimeoutInMs);
  }

  setupListeners() {
    this.listeners = {
      "start": ::this.onSocketStart,
      "stop": ::this.onSocketStop,
      "action": ::this.onActionSuccess,
      "action.fail": ::this.onActionFail,
      "broadcast": ::this.onBroadcast,
      "disconnect": ::this.onDisconnect
    };
  }

  setupStates() {
    this.sockets = {};
    this.running = false;
    this.lastConnectedSocket = null;
  }

  setupApps() {
    this.app = Express();
    this.server = http.Server(this.app);
    this.io = SocketIO(this.server);

    this.setupExpress(this.app);
    this.setupSocket(this.io);
  }

  setupExpress(app) {
    const defaultResponse = (res, promise) => {
      promise.then(() => {
        res.end("OK");
      }, (err) => {
        this.defaultErrorHandler(err);
        res.status(500);
        res.end(err.toString());
      });
    };

    this.emit("express.beforeSetup", app);

    app.use(bodyParser.text());
    app.post("/start", (req, res) => {
      this.logger.debug("Got start request from webhook");
      defaultResponse(res, this.start());
    });
    app.post("/stop", (req, res) => {
      this.logger.debug("Got stop request from webhook");
      defaultResponse(res, this.stop());
    });
    app.get("/sockets", (req, res) => {
      res.end(Object.keys(this.sockets).join(", "));
    });

    this.emit("express.afterSetup", app);
  }

  setupSocket(io) {
    this.emit("socket.beforeSetup", io);

    io.on("connection", (socket) => {
      forEach(this.listeners, (listener, name) => {
        socket.on(name, (msg) => listener(socket, msg));
      });
      this.onConnect(socket);
    });

    this.emit("socket.afterSetup", io);
  }

  makeRequest(path, data) {
    this.emit("controller.request", {method: "POST", path, data}, true);
    return axios.post(`http://localhost:${this.controllerPort}/${path}`, data);
  }

  onConnect(socket) {
    this.emit("socket.connect", socket);
    this.logger.debug(`Client '${socket.id}' connected!`);
    this.lastConnectedSocket = socket;
  }

  onDisconnect(socket) {
    this.emit("socket.disconnect", socket);
    this.logger.debug(`Client '${socket.id}' disconnected!`);
    if (this.running) {
      this.stop().then(noop, ::this.defaultErrorHandler);
    }
  }

  onSocketStart(socket) {
    if (this.running) return;
    this.emit("socket.socketStart", socket);
    this.logger.debug("Socket '" + socket.id + "' started");

    this.refreshOptionsAsync().then(({config}) => {
      const botTimeout = Number(config.General.TimeLimitInSeconds) * 1000;
      const worker = new Worker(this, config, socket);
      const manager = new WorkerManager(this, socket, worker);
      const context = manager.context;

      const errorHandler = (err) => {
        this.emit("worker.error", {context, error: err});
        this.defaultErrorHandler(err);
        this.stop().then(noop, ::this.defaultErrorHandler);
      };

      const timer = setTimeout(() => {
        if (!this.sockets[socket.id]) return;
        const error = new Error("Bot timed out!");
        this.emit("worker.timeout", {context, error});
        this.logger.debug("Bot reaches maximum time. Disconnecting...");
        errorHandler(error);
      }, botTimeout);

      this.sockets[socket.id] = {
        socket, worker, timer, manager,
        actions: {}
      };

      const workerEvents = [
        "beforeStart", "start", 
        "beforeSequence", "afterSequence", 
        "finish", "afterFinish",
        "beforeStop", "stop", "afterStop"
      ];
      forEach(workerEvents, (eventName) => {
        worker.on(eventName, (payload) => {
          this.emit("worker." + eventName, payload);
        });
      });

      this.makeRequest("start").then(() => {
        this.running = true;
        this.logger.info("Autopilot started.");
        return manager.start();
      }).then(() => {
        return this.stop();
      }).then(noop, errorHandler);
    }, ::this.defaultErrorHandler);
  }

  onSocketStop(socket) {
    if (!this.running) return;
    this.emit("socket.socketStop", socket);
    this.logger.debug("Got stop request from socket '" + socket.id + "'");
    this.stop().then(noop, ::this.defaultErrorHandler);
  }

  onBroadcast(socket, data) {
    this.emit("socket.broadcast", {
      id: data.id,
      name: data.action,
      payload: data.payload,
      socket, data
    }, true);
  }

  onAction(socket, data, callback) {
    const action = this.getAction(socket, data.id);
    // silently fail
    if (!action) return;
    this.emit("socket.action", {
      id: data.id,
      action,
      payload: data.payload,
      socket, data
    }, true);
    callback(action, data.payload);
    action.complete(data.payload);
    clearTimeout(action.timer);
  }

  onActionSuccess(socket, data) {
    this.onAction(socket, data, (action, payload) => {
      this.emit("socket.actionSuccess", {id: data.id, action, payload, socket, data}, true);
      action.success(payload);
    });
  }

  onActionFail(socket, data) {
    this.onAction(socket, data, (action, payload) => {
      this.emit("socket.actionFail", {id: data.id, action, payload, socket, data}, true);
      action.fail(payload);
    });
  }

  getAction(socket, id) {
    socket = this.sockets[socket.id];
    return socket ? socket.actions[id] : null;
  }

  sendAction(realSocket, actionName, payload, timeout) {
    timeout = !isObject(timeout) ? {
      stopOnTimeout: true,
      timeoutInMs: timeout
    } : timeout;
    timeout.timeoutInMs = timeout.timeoutInMs || this.timeout;

    return new Promise((resolve, reject) => {
      var resolved = false;
      const id = shortid.generate();
      const json = JSON.stringify(payload);
      const expression = `${actionName}(${json})`;
      const socket = this.sockets[realSocket.id];
      if (!socket) {
        reject(new Error("Socket not found!"));
        return;
      }

      const eventData = {
        id,
        socket: realSocket,
        action: actionName,
        payload, timeout
      };
      this.emit("socket.beforeSendAction", eventData, true);

      const actions = socket.actions;
      const done = () => {
        resolved = true;
        clearTimeout(actions[id].timer);
        delete actions[id];
      };

      actions[id] = {
        success: (payload) => {
          eventData.payload = payload;
          this.emit("socket.successSendAction", eventData, true);
          resolve(payload);
          done();
        },
        fail: (payload) => {
          eventData.payload = payload;
          this.emit("socket.failSendAction", eventData, true);
          reject(payload);
          done();
        },
        timer: timeout.timeoutInMs > 0 ? setTimeout(() => {
          if (resolved) {
            done();
            return;
          }

          const error = eventData.error = new Error(`Action ${expression} timed out after ${timeout.timeoutInMs}ms!`);
          this.emit("socket.timeoutSendAction", eventData, true);
          reject(error);
        }, timeout.timeoutInMs) : 0,
        complete: (payload) => {
          eventData.payload = payload;
          this.emit("socket.afterSendAction", eventData, true);
        }
      };

      const data = {
        id, payload, 
        timeout: timeout.timeoutInMs,
        action: actionName, 
        type: "request"
      };

      eventData.data = data;
      this.emit("socket.sendAction", eventData, true);
      realSocket.emit("action", data);
    });
  }

  stopSocket(id) {
    return new Promise((resolve, reject) => {
      if (!this.sockets[id]) {
        reject(new Error("Socket not found!"));
        return;
      }
      this.logger.debug("Stopping socket '" + id + "'");
      const {socket, timer, actions} = this.sockets[id];
      delete this.sockets[id];
      forEach(actions, (action) => {
        clearTimeout(action.timer);
      });
      clearTimeout(timer);
      socket.emit("stop");
      setTimeout(resolve, 1);
    });
  }

  listen() {
    this.emit("server.beforeListening");
    return new Promise((resolve) => {
      this.server.listen(this.port, "localhost", () => {
        this.emit("server.onListening");
        this.logger.debug("Started listening on localhost:" + this.port);
        resolve(this.server);
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      if (this.running) {
        this.logger.debug("Autopilot is already running");
        return resolve();
      }
      if (!this.lastConnectedSocket || !this.lastConnectedSocket.connected) {
        return reject(new Error("No connected sockets"));
      }
      this.emit("server.beforeStart", this.lastConnectedSocket);
      this.lastConnectedSocket.emit("start");
      this.onSocketStart(this.lastConnectedSocket);
      this.emit("server.onStart", this.lastConnectedSocket);
      return resolve();
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.running) {
        this.logger.debug("Autopilot is not running!");
        return resolve();
      }
      const handleSocket = (cb) => {
        const socketId = Object.keys(this.sockets).pop();
        if (!socketId) {
          this.makeRequest("stop").then(cb, ::this.defaultErrorHandler);
          return;
        }

        const socket = this.sockets[socketId];
        socket.manager.stop().then(() => {
          handleSocket(cb);
        }, () => {
          // ignore error anyway, but log them for debugging purpose
          // edit: nvm, it's getting too verbose lol
          // this.defaultErrorHandler(err);
          this.stopSocket(socketId).then(() => handleSocket(cb), reject);
        });
      };
      this.emit("server.beforeStop");
      handleSocket(() => {
        this.running = false;
        this.sockets = {};
        this.emit("server.stop");
        this.logger.info("Autopilot stopped.");
        resolve();
      });
    });
  }
  
  defaultErrorHandler(err) {
    this.emit("server.error", err);
    err = err || new Error("Unknown error occured");
    if (this.config.Debug.ThrowErrors) {
      throw err;
    }
    this.logger.error(err instanceof Error ? err : err.toString());
  }

  emit(eventName, payload, immutable) {
    payload = payload || {};
    if (!isObject(payload)) {
      payload = {data: payload};
    }
    payload["$eventName"] = eventName;
    if (immutable) {
      // Make the payload immutable when needed
      payload = Immutable.Map(payload);
    }
    this.subject.next(payload);
  }

  getObservable(eventName) {
    return this.subject.map((payload) => {
      // We don't expect the observers to handle Immutable.js object though
      // So we convert them back to plain JS object
      return (payload && payload.toJS) ? payload.toJS() : payload;
    }).filter((payload) => {
      return payload["$eventName"] === eventName;
    }).map((payload) => {
      delete payload["$eventName"];
      return payload;
    });
  }

  on(eventName, observer, onError, onComplete) {
    return this.getObservable(eventName).subscribe(
      observer, 
      onError || ::this.defaultErrorHandler,
      onComplete
    );
  }
}
