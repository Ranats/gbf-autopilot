const fs = require("fs");
const resolve = require("path").resolve;
const ini = require("ini");
const basePluginNames = ["core", "viramate"];

const readConfig = () => {
  const content = fs.readFileSync(resolve(__dirname, "./config.ini"), "utf-8");
  const config = ini.parse(content);
  return config;
};

const readPluginNames = () => {
  try {
    return basePluginNames.concat(require("../plugins"));
  } catch (err) {
    return basePluginNames;
  }
};

const readOptions = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve({
        config: readConfig(),
        pluginNames: readPluginNames(),
        rootDir: __dirname
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
