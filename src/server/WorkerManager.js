export default class WorkerManager {
  constructor(server, socket, worker) {
    this.server = server;
    this.socket = socket;
    this.worker = worker;
    this.pipeline = [];
  }

  start() {
    return this.worker.start(this.pipeline);
  }

  stop() {
    return new Promise((resolve) => {
      resolve();
    });
  }

  isRunning() {
    return this.worker.running;
  }
}
