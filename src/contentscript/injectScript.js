export function removeScript(parent, script) {
  if (process.env.NODE_ENV === "production") {
    window.setTimeout(() => {
      parent.removeChild(script);
    }, 1);
  }
}

export default function injectScript(constructor, callback) {
  const url = chrome.runtime.getURL("/");
  const parent = (document.head || document.documentElement);
  const script = document.createElement("script");
  const scriptArg = ["this", JSON.stringify(url), JSON.stringify(process.env)];
  script.type = "text/javascript";
  script.innerHTML = "(" + constructor.toString() + ")(" + scriptArg.join(", ") +")";
  parent.appendChild(script);
  callback(EXTERNAL_TOKEN);
  removeScript(parent, script);
}
