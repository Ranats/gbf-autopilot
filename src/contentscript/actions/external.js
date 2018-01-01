const externalHandlers = {};
["poker", "ajax"].forEach((action) => {
  const handler = function(payload, done, fail) {
    this.requestExternal(action, payload).then(done, fail);
  };
  externalHandlers[action] = handler;
});

export default externalHandlers;
