import {isString, isObject, forEach} from "lodash";

function urlEncode(data) {
  const result = [];
  forEach(data, (val, key) => {
    result.push(key + "=" + encodeURIComponent(val));
  });
  return result.join("&");
}

export default (context) => ({
  error: (payload, done, fail) => {
    fail("Action not found!");
  },
  poker: (modelName, done) => {
    done(context.Game.view[modelName + "Model"].attributes);  
  },
  ajax: (options, success, error) => {
    if (isString(options)) {
      options = {
        method: "GET",
        url: options,
      };
    }
    const xhr = new XMLHttpRequest;
    const method = (options.method || "GET").toUpperCase();

    xhr.open(method, options.url, true);
    if (method != "GET") {
    }

    xhr.addEventListener("readystatechange", () => {
      if (xhr.readyState === xhr.DONE) {
        const contentType = xhr.getResponseHeader("Content-Type");
        const responseText = xhr.responseText;
        const data = contentType.indexOf("application/json") >= 0 ?
          JSON.parse(responseText) : responseText;
        if (xhr.status < 400) {
          success(data);
        } else {
          error(data);
        }
      }
    });

    if (method != "GET") {
      const contentType = options.dataType != "json" ?
        "application/x-www-form-urlencoded" :
        "application/json";
      const data = options.dataType != "json" ?
        urlEncode(options.data) :
        JSON.stringify(options.data);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.send(method != "GET" ? data : null);
    } else {
      xhr.send();
    }
  }
});
