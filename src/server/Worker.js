import Rx from "rxjs/Rx";

export default class Worker {
  constructor(server, config, socket) {
    this.server = server;
    this.logger = server.logger;
    this.defaultErrorHandler = ::server.defaultErrorHandler;

    this.subject = new Rx.Subject();
    this.observers = new WeakMap();

    this.config = config;
    this.socket = socket;
    this.port = Number(config.get("Controller.ListenerPort"));

    this.processTimeout = Number(config.get("Server.ProcessTimeoutInMs"));
    this.workerTimeout = Number(config.get("Server.WorkerTimeoutInMs"));
  }

  async sendAction(actionName, payload, timeout) {
    return await this.server.sendAction(
      this.socket,
      actionName,
      payload,
      timeout
    );
  }

  run(context, step, lastResult) {
    step = step.bind(this, context, lastResult);
    this.emit("beforeSequence", { context, sequence: step, lastResult });
    return new Promise((resolve, reject) => {
      const done = processed => {
        const result = resolve(processed);
        this.emit("afterSequence", {
          context,
          sequence: step,
          lastResult,
          result
        });
        return result;
      };

      const fail = err => {
        const result = reject(err);
        this.emit("errorSequence", {
          context,
          sequence: step,
          lastResult,
          result
        });
        return result;
      };

      try {
        var result;
        const processed = step();
        if (processed instanceof Promise) {
          result = processed.then(done, fail);
        } else if (processed instanceof Error) {
          result = fail(processed);
        } else {
          result = done(processed);
        }
        return result;
      } catch (err) {
        return fail(err);
      }
    });
  }

  on(eventName, observer) {
    const subscription = this.subject
      .filter(({ name }) => name === eventName)
      .map(({ payload }) => payload)
      .subscribe(observer);
    this.observers.set(observer, subscription);
    return subscription;
  }

  emit(eventName, payload) {
    this.subject.next({ name: eventName, payload });
    return this;
  }

  removeListener(eventName, observer) {
    this.observers.get(observer).unsubscribe();
    return this;
  }
}
