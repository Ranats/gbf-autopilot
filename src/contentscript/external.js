export default function external(context, extensionUrl, env) {
  const executeScript = (url, callback) => {
    // had to resort to synchronous ajax call due to race condition
    const xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    xhr.send();

    const parent = (document.head || document.documentElement);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = xhr.responseText;
    parent.appendChild(script);
    callback();

    if (env.NODE_ENV === "production") {
      window.setTimeout(() => {
        parent.removeChild(script);
      }, 1);
    }
  };

  executeScript(extensionUrl + "dist/vendor.js", () => {
    executeScript(extensionUrl + "dist/external.js", () => {});
  });

  const portSetup = (evt) => {
    if (!evt.data.token || evt.data.token !== EXTERNAL_TOKEN) return;
    window[EXTERNAL_TOKEN](context, evt.ports[0]);
    delete window[EXTERNAL_TOKEN];

    evt.preventDefault();
    evt.stopImmediatePropagation();
    window.removeEventListener("message", portSetup, true);
  };

  window.addEventListener("message", portSetup, true);
}
