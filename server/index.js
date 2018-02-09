require("babel-polyfill");
require("dotenv").config();
const fs = require("fs");
const resolve = require("path").resolve;
const ini = require("ini");

const rootDir = resolve(__dirname, "../");
const readConfig = configPath => {
  const content = fs.readFileSync(resolve(rootDir, configPath), "utf-8");
  return ini.parse(content);
};
const readScenarioConfig = configPath => {
  const content = fs.readFileSync(resolve(rootDir, configPath), "utf-8");
  return JSON.parse(content);
};
const readExtensionNames = () => {
  try {
    return require("../extensions");
  } catch (err) {
    return [];
  }
};

const readOptions = () => {
  return new Promise((resolve, reject) => {
    try {
      const config = readConfig("config.ini");
      const scenarioConfig = readScenarioConfig(config.General.ScenarioConfig);

      resolve({
        rootDir,
        config,
        scenarioConfig,
        extensionNames: readExtensionNames()
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
    require("babel-register");
    return require("../src/server").default;
  }
};

module.exports = function() {
  return readOptions().then(
    options => {
      const Server = getServerClass();
      return new Server(options, readOptions).listen();
    },
    err => {
      throw err;
    }
  );
};
