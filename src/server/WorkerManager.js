export default class WorkerManager {
  constructor(server, socket, worker) {
    this.server = server;
    this.socket = socket;
    this.worker = worker;

    this.pipeline = [];
    this.context = {server, socket, worker, manager: this};
    this.running = false;
  }

  setPipeline(pipeline) {
    this.pipeline = pipeline;
    return this;
  }

  start() {
    this.emit("beforeStart", this.context);
    return this.worker.start(this.context, this.pipeline.slice(0));
  }

  process(pipeline) {
    return this.worker.process(this.context, pipeline);
  }

  stop() {
    this.emit("beforeStop", this.context);
    return new Promise((resolve, reject) => {
      this.worker.stop().then((context) => {
        this.emit("afterStop", context);
        return this.server.stopSocket(this.socket.id);
      }).then(resolve, reject);
    });
  }

  on(eventName, listener) {
    return this.worker.on(eventName, listener);
  }

  emit(eventName, payload) {
    return this.worker.emit(eventName, payload);
  }

  isRunning() {
    return this.worker.running;
  }
}
