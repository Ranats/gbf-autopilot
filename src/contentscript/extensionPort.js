import PortMessaging from "../lib/messaging/PortMessaging";
import requestHandlerFactory from "./handleRequest";

export default function(requestExternal) {
  const handleRequest = requestHandlerFactory(requestExternal);
  const extensionPort = new PortMessaging();
  extensionPort.setup(chrome.runtime.connect(), (port, listeners) => {
    port.onMessage.addListener(listeners.onMessage);
    port.onDisconnect.addListener(listeners.onDisconnect);
  });
  extensionPort.onRequest = (request) => {
    handleRequest(request, (response) => {
      extensionPort.sendMessage(response);
    });
  };
  return extensionPort;
}
