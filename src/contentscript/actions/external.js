const externalHandlers = {};
[
  "poker", "ajax", 
  "battle.potion", 
  "battle.assist"
].forEach((action) => {
  const handler = function(payload, done, fail) {
    this.requestExternal(action, payload).then(done, fail);
  };
  externalHandlers[action] = handler;
});

export default externalHandlers;
