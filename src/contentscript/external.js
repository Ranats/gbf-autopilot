export default function(context, token) {
  var $id = 1; // we can't use shortid module, so we generate our own id ;)
  var port;
  const actionHandlers = {
    error: (payload, done, fail) => {
      fail("Action not found!");
    },
    poker: (modelName, done) => {
      done(window.Game.view[modelName + "Model"].attributes);  
    }
  };
  const log = (message) => {
    console.log("ext>", message);
  };
  const broadcastMessage = (action, payload) => {
    port.postMessage({
      id: ++$id,
      type: "broadcast",
      action, token, payload
    });
  };
  const handleMessage = (evt) => {
    if (evt.data.token !== token) return;
    if (!evt.data.id) return;
    const {id, action, payload} = evt.data;
    const handler = actionHandlers[action] || actionHandlers.error;
    handler(payload, (result) => {
      port.postMessage({
        id, action, token,
        type: "response",
        payload: result,
        success: true
      });
    }, (result) => {
      port.postMessage({
        id, action, token,
        type: "response",
        payload: result,
        success: false
      });
    });
  };
  const setupChannel = (evt) => {
    if (evt.data.token !== token) return;
    port = evt.ports[0];
    port.onmessage = handleMessage;
    port.onmessageerror = ::console.error;
    window.removeEventListener("message", setupChannel, true);
    evt.preventDefault();
    evt.stopImmediatePropagation();
    log("External channel established");
  };

  window.addEventListener("message", setupChannel, true);

  const XHR = window.XMLHttpRequest;
  const xhrStates = new WeakMap();
  function getXhrState(xhr) {
    if (!xhrStates.has(xhr)) xhrStates.set(xhr, {});
    return xhrStates.get(xhr);
  }
  function toArray(obj) {
    return Array.prototype.slice.apply(obj);
  }

  const orig_open = XHR.prototype.open;
  XHR.prototype.open = function(method, url) {
    const xhrState = getXhrState(this);
    xhrState.method = method;
    xhrState.url = url;

    this.addEventListener("readystatechange", function() {
      if (this.readyState === XHR.DONE && (this.responseType == "" || this.responseType == "text")) {
        xhrState.response = this.responseText;
        xhrState.status = this.status;
        broadcastMessage("ajaxFinish", xhrState);
      }
    });
    return orig_open.apply(this, toArray(arguments));
  };
  XHR.prototype.open.toString = orig_open.toString.bind(orig_open);

  const orig_send = XHR.prototype.send;
  XHR.prototype.send = function(data) {
    const xhrState = getXhrState(this);
    xhrState.request = data;
    return orig_send.apply(this, toArray(arguments));
  };
  XHR.prototype.send.toString = orig_send.toString.bind(orig_send);

}
