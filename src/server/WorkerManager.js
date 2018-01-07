import shortid from "shortid";

export default class WorkerManager {
  constructor(server, socket, worker) {
    this.server = server;
    this.socket = socket;
    this.worker = worker;
    this.config = server.config;
    this.logger = server.logger;
    this.running = false;
  }

  createContext() {
    const context = {
      id: shortid.generate(),
      config: this.config,
      server: this.server, 
      socket: this.socket, 
      worker: this.worker, 
      logger: this.logger,
      manager: this,

      isRunning: () => this.running
    };
    context.run = this.run.bind(this, context);
    context.process = this.process.bind(this, context);
    return context;
  }

  setPipeline(pipeline) {
    this.pipeline = pipeline;
    return this;
  }

  start() {
    const stop = (context, result) => {
      context.result = result;
      this.emit("beforeStop", context);
      this.running = false;
      delete context.finish;
      delete context.error;
      this.emit("stop", context);
    };

    return new Promise((resolve, reject) => {
      if (this.running) {
        return reject(new Error("Manager already running"));
      }

      const context = this.createContext();
      this.emit("beforeStart", context);
      this.running = true;
      this.resolveLater = context.finish = resolve.bind(resolve, context);
      this.rejectLater = context.error = reject.bind(reject, context);
      this.emit("start", context);
    }).then((context, result) => {
      stop(context, result);
      return result;
    }, (context, err) => {
      stop(context, err);
      throw err;
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.running) {
        return reject(new Error("Manager not running"));
      }

      this.running = false;
      return this.server.stopSocket(this.socket.id).then(resolve, reject);
    });
  }

  on(eventName, observer) {
    return this.worker.on(eventName, observer);
  }

  emit(eventName, payload) {
    this.worker.emit(eventName, payload);
    return this;
  }

  removeListener(eventName, observer) {
    this.worker.removeListener(eventName, observer);
    return this;
  }

  process(context, pipeline, lastResult) {
    return new Promise((resolve, reject) => {
      const step = pipeline.shift();
      if (!step || !context.isRunning()) {
        if (lastResult instanceof Error) {
          return reject(lastResult);
        } else {
          return resolve(lastResult);
        }
      }

      return this.run(context, step, lastResult).then((result) => {
        return this.process(context, pipeline, result);
      }).then(resolve, reject);
    });
  }


  run(context, step, lastResult) {
    return new Promise((resolve, reject) => {
      if (!context.isRunning()) {
        if (lastResult instanceof Error) {
          return reject(lastResult);
        } else {
          return resolve(lastResult);
        }
      }
      return this.worker.run(context, step, lastResult).then(resolve, reject);
    });
  }

  isRunning() {
    return this.running;
  }
}
