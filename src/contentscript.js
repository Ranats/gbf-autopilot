import shortid from "shortid";

import external from "./contentscript/external";
import injectScript from "./contentscript/injectScript";
import extensionPortFactory from "./contentscript/extensionPort";
import externalPortFactory from "./contentscript/externalPort";

const channel = new MessageChannel();
const externalPort = externalPortFactory(channel.port1);
const requestExternal = ::externalPort.sendRequest;
const extensionPort = extensionPortFactory(requestExternal);
const requestExtension = ::extensionPort.sendRequest;
externalPort.onBroadcast = ({action, payload}) => {
  if (action === "log") {
    console.log("ext>", payload);
  } else {
    extensionPort.sendBroadcast(shortid.generate(), action, payload);
  }
};

function portSetup() {
  requestExtension("LOADED").then(() => {
    console.log("Connected to extension");
  }, ::console.error);
  window.removeEventListener("load", portSetup);
}

window.addEventListener("load", portSetup);
window.addEventListener("hashchange", (evt) => {
  extensionPort.sendBroadcast(shortid.generate(), "hashchange", {
    oldUrl: evt.oldURL,
    newUrl: evt.newURL
  });
});

injectScript(external, (token) => {
  window.postMessage({token}, "*", [channel.port2]);
});
