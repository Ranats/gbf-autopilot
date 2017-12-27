import forEach from "lodash/forEach";

export default class Worker {
  constructor(server, config, socket) {
    this.server = server;
    this.logger = server.logger;
    this.defaultErrorHandler = ::server.defaultErrorHandler;
    this.listeners = {};
    this.running = false;
    this.config = config;
    this.socket = socket;
    this.port = Number(config.Controller.ListenerPort);
  }

  sendAction(actionName, payload, timeout) {
    return this.server.sendAction(this.socket, actionName, payload, timeout);
  }

  start(context, pipeline) {
    return new Promise((resolve, reject) => {
      if (this.running) {
        resolve(context);
        return;
      }

      this.running = true;
      this.emit("start", {context, pipeline});
      this.process(context, pipeline).then((context) => {
        this.running = false;
        this.emit("afterFinish", context);
        resolve(context);
      }, reject);
    });
  }

  stop(context) {
    return new Promise((resolve, reject) => {
      if (!this.running) {
        resolve(context);
        return;
      }

      const callback = (payload) => {
        this.removeListener("finish", callback);
        this.emit("stop", payload);
      };
      const callbackError = (payload) => {
        this.removeListener("error", callbackError);
        reject(payload.error);
      };
      const callbackAfter = (context) => {
        this.removeListener("error", callbackError);
        this.removeListener("afterFinish", callbackAfter);
        resolve(context);
      };

      this.on("finish", callback);
      this.on("error", callbackError);
      this.on("afterFinish", callbackAfter);
      this.running = false;
    });
  }

  process(context, pipeline, lastResult) {
    return new Promise((resolve, reject) => {
      const next = (result) => {
        context.lastResult = result;
        this.emit("afterSequence", {sequence, context, pipeline, result});
        this.process(context, pipeline, result).then(resolve, reject);
      };

      const sequence = pipeline.shift();
      if (!sequence || !this.running) {
        this.emit("finish", {context, result: lastResult});
        resolve(context);
        return;
      }

      this.emit("beforeSequence", {sequence, context, pipeline});
      this.logger.debug("Running sequence:", sequence.name);

      try {
        const promise = sequence(context, lastResult);
        if (promise instanceof Promise) {
          promise.then(next, reject);
        } else {
          next(promise);
        }
      } catch (e) {
        this.emit("error", {sequence, context, pipeline, error: e});
        reject(e);
      }
    });
  }

  on(eventName, listener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
    return this;
  }

  emit(eventName, payload) {
    forEach(this.getListeners(eventName), (listener) => {
      listener(payload);
    });
    return this;
  }

  getListeners(eventName) {
    return this.listeners[eventName] || [];
  }

  removeListener(eventName, listener) {
    const listeners = this.getListeners(eventName);
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    return this;
  }
}
