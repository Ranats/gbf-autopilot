import {URL} from "url";
import axios from "axios";
import shortid from "shortid";

export const JSONRPC_VERSION = "2.0";

/**
 * Create a JSON-RPC client
 * @param {number} port Port of the server
 * @param {string} [host=localhost] Hostname of the server
 * @param {string} [path=/] Path endpoint
 */
export default function JsonRpcClient(port, host, path) {
  host = host || "localhost";
  path = path || "/";
  
  return new Proxy({
    port, host, path,
    version: JSONRPC_VERSION,

    getUrl() {
      return new URL(path, `http://${this.host}:${this.port}`);
    },

    request(method, arg, ...args) {
      var params = [];
      if (args.length > 0) {
        params = [arg].concat(args);
      } else {
        if (typeof arg === "object") {
          params = arg;
        } else {
          params = [arg];
        }
      }

      const url = this.getUrl().toString();
      const data = {
        id: shortid.generate(),
        jsonrpc: this.version,
        method
      };
      if (params) data.params = params;
      return axios.post(url, data).then((resp) => {
        const {result, error} = resp.data;
        if (error) {
          throw Object.assign(new Error(error.message), {
            code: error.code,
            data: error.data
          });
        }
        return result;
      });
    }   
  }, {
    get(target, prop) {
      if (target[prop]) return target[prop];
      return (arg, ...args) => {
        return target.request(prop, arg, ...args);
      };
    }
  });
}
