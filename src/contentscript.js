import {actions} from "./contentscript/actions";
import PortMessaging from "./lib/messaging/PortMessaging";
import shortid from "shortid";
import external from "./contentscript/external";

const channel = new MessageChannel();
const removeScript = (parent, script) => {
  if (process.env.NODE_ENV === "production") {
    window.setTimeout(() => {
      parent.removeChild(script);
    }, 1);
  }
};
const injectScript = (constructor, callback) => {
  const url = chrome.runtime.getURL("/");
  const parent = (document.head || document.documentElement);
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.innerHTML = "(" + constructor.toString() + ")(this, " + JSON.stringify(url) + ");";
  parent.appendChild(script);
  callback(EXTERNAL_TOKEN);
  removeScript(parent, script);
};

injectScript(external, (token) => {
  window.postMessage({token}, "*", [channel.port2]);
});

const port = new PortMessaging();
port.middleware("receive", (evt, next, fail) => {
  const message = evt.data;
  if (message.token !== EXTERNAL_TOKEN) {
    fail(new Error("Invalid token!"));
  } else {
    next(message);
  }
});
port.middleware("send", (message, next) => {
  message.token = EXTERNAL_TOKEN;
  next(message);
});
port.setup(channel.port1, (port, listeners) => {
  port.onmessage = listeners.onMessage;
});

const requestExternal = ::port.sendRequest;
const handleRequest = (request, sendResponse) => {
  var resolved = false;
  var rejected = false;
  var callHandler;
  const {id, action, payload, timeout} = request;
  const handler = actions[action];
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

  callHandler = () => {
    if (handler) {
      return handler.call({
        actions, requestExternal
      }, payload, done, fail, retry);
    } else {
      return new Error("Action '" + action + "' not found!");
    }
  };

  var result = callHandler();

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

const extensionPort = new PortMessaging();
extensionPort.setup(chrome.runtime.connect(), (port, listeners) => {
  port.onMessage.addListener(listeners.onMessage);
  port.onDisconnect.addListener(listeners.onDisconnect);
});
const requestExtension = ::extensionPort.sendRequest;
extensionPort.onRequest = (request) => {
  handleRequest(request, (response) => {
    extensionPort.sendMessage(response);
  });
};
port.onBroadcast = ({action, payload}) => {
  if (action === "log") {
    console.log("ext>", payload);
  } else {
    extensionPort.sendBroadcast(shortid.generate(), action, payload);
  }
};

const portSetup = () => {
  requestExtension("LOADED").then(() => {
    console.log("Connected to extension");
  }, ::console.error);
  window.removeEventListener("load", portSetup);
};

window.addEventListener("load", portSetup);
window.addEventListener("hashchange", (evt) => {
  extensionPort.sendBroadcast(shortid.generate(), "hashchange", {
    oldUrl: evt.oldURL,
    newUrl: evt.newURL
  });
});
