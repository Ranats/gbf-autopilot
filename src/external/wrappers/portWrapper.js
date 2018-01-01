import shortid from "shortid";

export default (actions) => ({
  broadcastMessage(action, payload) {
    this.sendMessage(shortid.generate(), "broadcast", action, payload);
  },
  sendMessage(id, type, action, payload, success) {
    this.port.postMessage({
      id, action, type,
      token: EXTERNAL_TOKEN,
      payload,
      success: success !== false
    });
  },
  onMessage(evt) {
    if (evt.data.token !== EXTERNAL_TOKEN) return;
    if (!evt.data.id) return;
    const {id, action, payload} = evt.data;
    const handler = actions[action] || actions.error;
    handler(payload, (result) => {
      this.sendMessage(id, "response", action, result, true);
    }, (result) => {
      this.sendMessage(id, "response", action, result, false);
    });
  },
  setup(port) {
    this.port = port;
    this.port.onmessage = ::this.onMessage;
    this.port.onmessageerror = ::this.onError;
    return this;
  },
  onError: ::console.error
});
