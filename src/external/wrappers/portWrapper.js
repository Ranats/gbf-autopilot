import shortid from "shortid";

export default (port, actions) => ({
  broadcastMessage(action, payload) {
    this.sendMessage(shortid.generate(), "broadcast", payload);
  },
  sendMessage(id, type, action, payload, success) {
    port.postMessage({
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
      this.sendMessage(id, "response", result, true);
    }, (result) => {
      this.sendMessage(id, "response", result, false);
    });
  },
  setup() {
    port.onmessage = ::this.onMessage;
    port.onmessageerror = ::this.onError;
  },
  onError: ::console.error
});
