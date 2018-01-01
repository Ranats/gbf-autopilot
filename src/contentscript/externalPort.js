import PortMessaging from "../lib/messaging/PortMessaging";

export default function(port) {
  const messaging = new PortMessaging();
  messaging.middleware("receive", (evt, next, fail) => {
    const message = evt.data;
    if (message.token !== EXTERNAL_TOKEN) {
      fail(new Error("Invalid token!"));
    } else {
      next(message);
    }
  });
  messaging.middleware("send", (message, next) => {
    message.token = EXTERNAL_TOKEN;
    next(message);
  });
  messaging.setup(port, (port, listeners) => {
    port.onmessage = listeners.onMessage;
  });
  return messaging;
} 
