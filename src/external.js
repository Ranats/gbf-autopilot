import ajaxInjection from "./external/injections/ajax";
import actionsWrapper from "./external/wrappers/actionsWrapper";
import portWrapper from "./external/wrappers/portWrapper";

const setupObservers = (portHandler, observables) => {
  observables.ajax.subscribe(({name, payload}) => {
    portHandler.broadcastMessage(name, payload);
  });
};

function external(context, port) {
  const ajaxObservable = ajaxInjection(context);
  const actionsHandler = actionsWrapper(context);
  const portHandler = portWrapper(actionsHandler).setup(port);
  setupObservers(portHandler, {
    ajax: ajaxObservable
  });
  console.log("ext> Loaded!");
  window.addEventListener("load", () => {
    portHandler.broadcastMessage("userId", context.Game.UserId);
  });
  return true;
}

window[EXTERNAL_TOKEN] = external;
