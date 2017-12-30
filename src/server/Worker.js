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

    this.processTimeout = Number(config.Server.ProcessTimeoutInMs);
    this.workerTimeout = Number(config.Server.WorkerTimeoutInMs);
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

      var done = false;
      const wrap = (cb) => {
        return (value) => {
          if (done) return;
          done = true;
          clearTimeout(timeout);
          cb(value);
        };
      };
      const timeout = setTimeout(() => {
        callbackError({context, error: new Error("Worker not stopping after " + (this.workerTimeout / 1000) + " sec(s)")});
      }, this.workerTimeout); 
      const callback = wrap((payload) => {
        this.removeListener("finish", callback);
        this.emit("stop", payload);
      });
      const callbackError = wrap((payload) => {
        this.removeListener("error", callbackError);
        reject(payload.error);
      });
      const callbackAfter = wrap((context) => {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        this.removeListener("error", callbackError);
        this.removeListener("afterFinish", callbackAfter);
        resolve(context);
      });

      this.on("finish", callback);
      this.on("error", callbackError);
      this.on("afterFinish", callbackAfter);
      this.running = false;
    });
  }

  process(context, pipeline, lastResult) {
    return new Promise((resolve, reject) => {
      const sequence = pipeline.shift();
      if (!sequence || !this.running) {
        this.emit("finish", {context, result: lastResult});
        resolve(lastResult);
        return;
      }

      var done = false;
      const wrap = (cb) => {
        return (value) => {
          if (done || !this.running) return;
          done = true;
          clearTimeout(timeout);
          cb(value);
        };
      };
      const next = wrap((result) => {
        context.result = result;
        this.emit("afterSequence", {sequence, context, pipeline, result});
        this.process(context, pipeline, result).then(resolve, reject);
      });
      const fail = wrap((err) => {
        this.running = false;
        this.emit("error", {sequence, context, pipeline, error: err});
        reject(err);
      });
      const timeout = !sequence.doNotTimeout ? setTimeout(() => {
        fail(new Error("Sequence not returning after " + (this.processTimeout / 1000) + " sec(s)"));
      }, this.processTimeout) : 0;

      this.emit("beforeSequence", {sequence, context, pipeline});
      // this.logger.debug("Running sequence:", sequence.name);

      try {
        const promise = sequence.call(this, context, lastResult);
        if (promise instanceof Promise) {
          promise.then(next, reject);
        } else {
          next(promise);
        }
      } catch (e) {
        fail(e);
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
