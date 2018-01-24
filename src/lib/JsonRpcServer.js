export const JSONRPC_VERSION = "2.0";

export default class JsonRpcServer {
  constructor(app, methods, path) {
    this.app = app;
    this.methods = methods;
    this.path = path || "/";
    this.setupEndpoint();
  }

  success(id, result) {
    return JSON.stringify({
      id,
      jsonrpc: JSONRPC_VERSION,
      result
    });
  }

  error(id, error) {
    const code = error.code || 500;
    const message = error.message || error.toString();
    const data = error.data;
    return JSON.stringify({
      id,
      jsonrpc: JSONRPC_VERSION,
      error: {code, message, data}
    });
  }

  handleRequest(req, res) {
    const {id, method, params} = req.body;
    const methodFunc = this.methods[method];
    if (!methodFunc) {
      return res.end(this.error(id, 404, "Method unknown"));
    }

    const result = methodFunc(params);
    try {
      if (result instanceof Promise) {
        return result.then((result) => {
          return this.success(id, result);
        }, (err) => {
          return this.error(id, err);
        }).then((json) => res.end(json));
      } else if (result instanceof Error) {
        return res.end(this.error(id, result));
      } else {
        return res.end(this.success(id, result));
      }
    } catch (err) {
      return res.end(this.error(id, err));
    }
  }

  setupEndpoint() {
    this.app.post(this.path, ::this.handleRequest);
  }
}
