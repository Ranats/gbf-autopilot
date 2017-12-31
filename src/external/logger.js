export default (portHandler) => (message) => {
  portHandler.sendBroadcast("log", message);
};
