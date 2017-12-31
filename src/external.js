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
  const portHandler = portWrapper(port, actionsHandler);
  setupObservers(portHandler, {
    ajax: ajaxObservable
  });
  console.log("ext> Loaded!");
  return true;
}

window[EXTERNAL_TOKEN] = external;
