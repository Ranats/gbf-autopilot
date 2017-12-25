export default class Worker {
  constructor(server, config, socket) {
    this.server = server;
    this.logger = server.logger;
    this.defaultErrorHandler = ::server.defaultErrorHandler;

    this.config = config;
    this.socket = socket;
    this.port = Number(config.Server.ControllerPort);
  }

  start(context, pipeline) {
    return this.process(context, pipeline);
  }

  process(context, pipeline) {
    return new Promise((resolve, reject) => {
      const sequence = pipeline.pop();
      if (!sequence) resolve(context);
      sequence(context).then((context) => {
        this.process(context, pipeline).then(resolve, reject);
      }, reject);
    });
  }
}
