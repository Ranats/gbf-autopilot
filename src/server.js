import http from "http";
import axios from "axios";
import shortid from "shortid";
import SocketIO from "socket.io";
import Express from "express";
import bodyParser from "body-parser";

import isObject from "lodash/isObject";
import forEach from "lodash/forEach";
import filter from "lodash/filter";
import noop from "lodash/noop";
import map from "lodash/map";

import Worker from "./server/Worker";
import WorkerManager from "./server/WorkerManager";

import Logger from "./lib/Logger";

export default class Server {
  constructor(options, readOptions) {
    this.options = options;
    this.readOptions = readOptions;

    this.config = options.config;
    this.rootDir = options.rootDir;
    this.logger = Logger(this.config);
    this.port = process.env.PORT || Number(options.config.Server.ListenerPort);
    this.plugins = this.loadPlugins(options.pluginNames);

    this.refreshOptions(options);
    this.setupListeners();
    this.setupStates();
    this.setupApps();
  }

  loadPlugins(pluginNames) {
    const plugins = [];
    const pluginPrefix = "gbf-autopilot";
    forEach(pluginNames, (pluginName) => {
      const pluginModuleName = [pluginPrefix, pluginName].join("-");
      const plugin = require(pluginModuleName);
      if (plugin.server) {
        plugins.push(plugin.server(this));
      }
    });
    return plugins;
  }

  getPluginSubmodules(name, cb) {
    const submodules = map(filter(this.plugins, (plugin) => {
      return !!plugin[name];
    }), (plugin) => {
      return plugin[name];
    });
    if (cb) forEach(submodules, cb);
    return submodules;
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
    this.timeout = Number(config.Server.ActionTimeoutInMs);
  }

  setupListeners() {
    this.listeners = {
      "start": ::this.onSocketStart,
      "stop": ::this.onSocketStop,
      "action": ::this.onActionSuccess,
      "action.fail": ::this.onActionFail,
      "disconnect": ::this.onDisconnect
    };
  }

  setupStates() {
    this.subscribers = [];
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

    this.getPluginSubmodules("express", (submodule) => {
      submodule(app);
    });
  }

  setupSocket(io) {
    io.on("connection", (socket) => {
      forEach(this.listeners, (listener, name) => {
        socket.on(name, (msg) => listener(socket, msg));
      });
      this.onConnect(socket);
    });

    this.getPluginSubmodules("socket", (submodule) => {
      submodule(io);
    });
  }

  makeRequest(path) {
    return axios.post(`http://localhost:${this.controllerPort}/${path}`);
  }

  onConnect(socket) {
    this.getPluginSubmodules("socket.onConnect", (submodule) => {
      submodule(socket);
    });
    this.logger.debug(`Client '${socket.id}' connected!`);
    this.lastConnectedSocket = socket;
  }

  onSocketStart(socket) {
    if (this.running) return;
    this.logger.debug("Socket '" + socket.id + "' started");

    this.refreshOptionsAsync().then(({config}) => {
      const botTimeout = Number(config.Server.BotTimeoutInMins);
      const worker = new Worker(this, config, socket);
      const manager = new WorkerManager(this, socket, worker);

      const errorHandler = (err) => {
        this.defaultErrorHandler(err);
        manager.stop().then(noop, ::this.defaultErrorHandler);
      };

      const timer = setTimeout(() => {
        if (!this.sockets[socket.id]) return;
        this.logger.debug("Bot reaches maximum time. Disconnecting...");
        errorHandler(new Error("Bot timed out!"));
      }, botTimeout * 60 * 1000);

      this.sockets[socket.id] = {
        socket, worker, timer, manager,
        actions: {}
      };

      this.makeRequest("start").then(() => {
        this.running = true;
        return manager.start();
      }).then(() => {
        this.getPluginSubmodules("socket.onSocketStart", (submodule) => {
          submodule(socket, worker, manager);
        });
      }, errorHandler);
    }, ::this.defaultErrorHandler);
  }

  onSocketStop(socket) {
    if (!this.running) return;
    this.logger.debug("Got stop request from socket '" + socket.id + "'");
    this.getPluginSubmodules("socket.onSocketStart", (submodule) => {
      submodule(socket);
    });
    this.stop().then(noop, ::this.defaultErrorHandler);
  }

  onAction(socket, data, callback) {
    const action = this.getAction(socket, data.id);
    // silently fail
    if (!action) return;
    if (this.config.Log.DebugSocket) {
      this.logger.debug("Socket: RECV", data);
    }
    callback(action, data.payload);
    this.getPluginSubmodules("socket.onAction", (submodule) => {
      submodule(action, data.payload, socket, data);
    });
    clearTimeout(action.timer);
  }

  onActionSuccess(socket, data) {
    this.onAction(socket, data, (action, payload) => {
      action.success(payload);
      this.getPluginSubmodules("socket.onActionSuccess", (submodule) => {
        submodule(action, payload, socket, data);
      });
    });
  }

  onActionFail(socket, data) {
    this.onAction(socket, data, (action, payload) => {
      action.fail(payload);
      this.getPluginSubmodules("socket.onActionFail", (submodule) => {
        submodule(action, payload, socket, data);
      });
    });
  }

  onDisconnect(socket) {
    this.logger.debug(`Client '${socket.id}' disconnected!`);
    if (this.running) {
      this.stop().then(noop, ::this.defaultErrorHandler);
    }
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

      const actions = socket.actions;
      const done = () => {
        resolved = true;
        clearTimeout(actions[id].timer);
        delete actions[id];
      };

      actions[id] = {
        success: (payload) => {
          resolve(payload);
          done();
        },
        fail: (payload) => {
          reject(payload);
          done();
        },
        timer: timeout.timeoutInMs > 0 ? setTimeout(() => {
          if (resolved) {
            done();
            return;
          }

          const cb = () => {
            reject(new Error(`Action ${expression} timed out after ${timeout.timeoutInMs}ms!`));
          };
          cb();
          /*
          if (timeout.stopOnTimeout) {
            this.stop().then(cb, cb);
          } else {
            cb();
          }
          */
        }, timeout.timeoutInMs) : 0
      };

      const data = {
        id, payload, 
        timeout: timeout.timeoutInMs,
        action: actionName, 
        type: "request"
      };

      if (this.config.Log.DebugSocket) {
        this.logger.debug("Socket: SEND", data);
      }
      realSocket.emit("action", data);
    });
  }

  stopSocket(id) {
    return new Promise((resolve, reject) => {
      if (!this.sockets[id]) {
        reject(new Error("Socket not found!"));
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
    this.server.listen(this.port, "localhost", () => {
      this.logger.debug("Started listening on localhost:" + this.port);
    });
    return this;
  }

  start() {
    return new Promise((resolve, reject) => {
      if (this.running) {
        reject(new Error("Autopilot is already running"));
        return;
      }
      if (!this.lastConnectedSocket || !this.lastConnectedSocket.connected) {
        reject(new Error("No connected sockets"));
        return;
      }
      this.lastConnectedSocket.emit("start");
      this.onSocketStart(this.lastConnectedSocket);
      this.getPluginSubmodules("start", (submodule) => {
        submodule(this.lastConnectedSocket);
      });
      resolve();
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.running) {
        reject(new Error("Autopilot is not running"));
        return;
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
        }, ::this.defaultErrorHandler);
      };
      handleSocket(() => {
        this.running = false;
        this.sockets = {};
        forEach(this.subscribers, (subscriber) => {
          (subscriber.onStop || noop)();
        });
        this.getPluginSubmodules("stop", (submodule) => {
          submodule();
        });
        resolve();
      });
    });
  }
  
  defaultErrorHandler(err) {
    this.logger.error(err instanceof Error ? err : err.toString());
  }
}
