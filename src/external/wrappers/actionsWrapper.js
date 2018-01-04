import {isString, forEach} from "lodash";

function urlEncode(data) {
  const result = [];
  forEach(data, (val, key) => {
    result.push(key + "=" + encodeURIComponent(val));
  });
  return result.join("&");
}

function normalizeUrl(context, url, withUserQuery) {
  url = new URL(url, context.location.origin);
  const time = new Date().getTime();
  const uid = (context.Game || {}).UserId;
  const query = url.search.indexOf("=") > 0 ? url.search.split("&") : [];
  query.push("_=" + time);
  if (withUserQuery) {
    query.push(
      "t=" + time,
      "u=" + uid
    );
  }

  return url.origin + url.pathname + "?" + query.join("&");
}

function ajaxFallback(context, options, success, error) {
  const xhr = new XMLHttpRequest;
  const method = (options.method || "GET").toUpperCase();

  xhr.open(method, options.url, true);
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
    const data = isString(options.data) ? options.data :
      (options.dataType != "json" ?
        urlEncode(options.data) :
        JSON.stringify(options.data));
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.send(data);
  } else {
    xhr.send();
  }
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
    if ((context.$ || {}).ajax) {
      options.url = normalizeUrl(context, options.url);
      options.success = success;
      options.error = error;
      context.$.ajax(options);
    } else {
      options.url = normalizeUrl(context, options.url, true);
      ajaxFallback(context, options, success, error);
    }
  }
});
