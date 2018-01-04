export default class WorkerManager {
  constructor(server, socket, worker) {
    this.server = server;
    this.socket = socket;
    this.worker = worker;
    this.running = false;
  }

  createContext() {
    const context = {
      server: this.server, 
      socket: this.socket, 
      worker: this.worker, 
      manager: this,

      run: this.run.bind(this, context),
      process: this.process.bind(this, context),
      isRunning: () => this.running
    };
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
        return resolve();
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
        return resolve();
      }

      this.running = false;
      const subscription = this.on("stop", ({result}) => {
        subscription.unsubscribe();
        return result instanceof Error ? reject(result) : resolve(result);
      });
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

  async process(context, pipeline, lastResult) {
    const step = pipeline.shift();
    if (!step || !context.isRunning()) {
      if (lastResult instanceof Error) {
        throw lastResult;
      } else {
        return lastResult;
      }
    }

    const result = await this.run(context, step, lastResult);
    return await this.process(context, pipeline, result);
  }


  async run(context, step, lastResult) {
    return await this.worker.run(context, step, lastResult);
  }

  isRunning() {
    return this.running;
  }
}
