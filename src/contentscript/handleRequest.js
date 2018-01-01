import {actions} from "./actions";

export default function (requestExternal) {
  return function handleRequest(request, sendResponse) {
    var resolved = false;
    var rejected = false;
    const {id, action, payload, timeout} = request;
    const handler = actions[action];
    const callHandler = () => {
      if (handler) {
        return handler.call({
          actions, requestExternal
        }, payload, done, fail, retry);
      } else {
        return new Error("Action '" + action + "' not found!");
      }
    };
    const done = (payload) => {
      if (resolved || rejected) return;
      resolved = true;
      sendResponse({id, type: "response", action, payload, success: true});
    };
    const fail = (payload) => {
      if (resolved || rejected) return;
      rejected = true;
      payload = payload instanceof Error ? payload.message : payload;
      sendResponse({id, type: "response", action, payload, success: false});
    };
    const retry = (callback, timeout) => {
      if (!isNaN(callback)) {
        timeout = callback;
        callback = null;
      }
      if (!rejected) {
        setTimeout(callback || callHandler, timeout || 1000 / 125);
      } else {
        fail("Rejected!");
      }
    };

    const result = callHandler();
    if (result instanceof Error) {
      fail(actions.error(action));
    } else if (result !== undefined) {
      done(result);
    } else {
      setTimeout(() => {
        fail(new Error("Action '" + action + "' timed out after " + (timeout / 1000) + " sec(s)"));
      }, timeout);
    }
  };
}
