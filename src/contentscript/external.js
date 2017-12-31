export default function external(context, extensionUrl) {
  const executeScript = (url, callback) => {
    // had to resort to synchronous ajax call due to race condition
    const xhr = new XMLHttpRequest;
    xhr.open("GET", url, false);
    xhr.send();
    new Function(xhr.responseText)();
    callback();
    /*
    xhr.send();
    const parent = (document.head || document.documentElement);
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      callback();
    };
    parent.appendChild(script);
    */
  };

  const portSetup = (evt) => {
    if (!evt.data.token || evt.data.token !== EXTERNAL_TOKEN) return;
    executeScript(extensionUrl + "dist/vendor.js", () => {
      executeScript(extensionUrl + "dist/external.js", () => {
        window[EXTERNAL_TOKEN](context, evt.ports[0]);
        delete window[EXTERNAL_TOKEN];
      });
    });

    evt.preventDefault();
    evt.stopImmediatePropagation();
    window.removeEventListener("message", portSetup, true);
  };

  window.addEventListener("message", portSetup, true);
}
