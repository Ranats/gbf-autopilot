const fs = require("fs");
const resolve = require("path").resolve;
const ini = require("ini");

const rootDir = resolve(__dirname, "../");
const readConfig = () => {
  const content = fs.readFileSync(resolve(rootDir, "config.ini"), "utf-8");
  const config = ini.parse(content);
  return config;
};

const readExtensionNames = () => {
  try {
    return require("../extensions");
  } catch (err) {
    console.log("extensions.js not found. Not loading extensions.");
    return [];
  }
};

const readOptions = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve({
        rootDir,
        config: readConfig(),
        extensionNames: readExtensionNames(),
      });
    } catch (err) {
      reject(err);
    }
  });
};

const getServerClass = () => {
  if (process.env.NODE_ENV === "production") {
    return require("./dist/server").default;
  } else {
    require("babel-polyfill");
    require("babel-register");
    return require("../src/server").default;
  }
};

readOptions().then((options) => {
  const Server = getServerClass();
  new Server(options, readOptions).listen();
}, (err) => {
  throw err;
});
