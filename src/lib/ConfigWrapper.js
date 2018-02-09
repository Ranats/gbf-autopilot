import { unflatten } from "flat";

export function destructure(object) {
  const newObject = {};
  Object.keys(object).forEach(key => {
    let value = object[key];
    if (typeof value === "object") {
      value = destructure(value);
    }

    const parts = key.split(".");

    let parent = newObject;
    while (parts.length > 1) {
      key = parts.shift();
      parent[key] = {};
      parent = parent[key];
    }
    key = parts.shift();
    parent[key] = value;
  });
  return newObject;
}

export function traverse(object, keys, value) {
  if (!Array.isArray(keys)) keys = keys.split(".");
  let key, parent;
  while (keys.length > 0) {
    key = keys.shift();
    parent = object;
    object = parent[key];
    if (typeof object === "undefined") {
      if (typeof value !== "undefined") {
        object = parent[key] = {};
      } else {
        return null;
      }
    }
  }
  if (typeof value !== "undefined") {
    parent[key] = object = value;
  }
  return object;
}

export default class ConfigWrapper {
  constructor(config) {
    this.config = unflatten(config);
  }

  get(key) {
    return traverse(this.config, key);
  }

  set(key, value) {
    traverse(this.config, key, value);
    return this;
  }

  toObject() {
    return this.config;
  }
}
