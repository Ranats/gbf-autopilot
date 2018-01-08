import Rx from "rxjs/Rx";

export default function ajaxInjection(context) {
  const subject = new Rx.Subject;
  function emit(name, payload) {
    subject.next({name, payload});
  }

  const XHR = context.XMLHttpRequest;
  const xhrStates = new WeakMap;
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
        xhrState.contentType = this.getResponseHeader("Content-Type");
        xhrState.status = this.status;
        xhrStates.delete(this);
        emit("ajaxFinish", xhrState);
      }
    });
    return orig_open.apply(this, toArray(arguments));
  };
  XHR.prototype.open.toString = orig_open.toString.bind(orig_open);

  /*
  const orig_send = XHR.prototype.send;
  XHR.prototype.send = function(data) {
    const xhrState = getXhrState(this);
    xhrState.request = data;
    return orig_send.apply(this, toArray(arguments));
  };
  XHR.prototype.send.toString = orig_send.toString.bind(orig_send);
  */

  return subject;
}
