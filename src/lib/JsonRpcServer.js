export const JSONRPC_VERSION = "2.0";

export default class JsonRpcServer {
  constructor(server, methods, path) {
    this.server = server;
    this.methods = methods;
    this.path = path || "/";
    // this.server.on("request", ::this.handleRequest);
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

  handleBody(res, body) {
    const json = JSON.stringify(body);
    const {id, method, params} = json;
    const methodFunc = this.methods[method];
    if (!methodFunc) {
      return res.end(this.error(id, 404, "Method unknown"));
    }

    const result = methodFunc(params);
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
  }

  handleRequest(req, res) {
    if (req.method != "POST" || req.url != this.path) {
      return;
    }

    const data = [];
    req.on("data", (chunk) => data.push(chunk))
      .on("end", () => {
        const body = Buffer.concat(data).toString();
        this.handleBody(res, body);
      });
  }
}
