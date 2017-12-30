const oneTimeSubscribe = (context, callback) => {
  const subscribers = context.hashSubscribers;
  const cb = (evt) => {
    subscribers.delete(cb);
    callback(evt);
  };
  subscribers.add(cb);
};

export default {
  "location": function() {
    return window.location;
  },
  "location.change": function(location, done) {
    if (location.startsWith("#")) {
      window.location.hash = location;
    } else {
      window.location = location;
    }
    window.setTimeout(() => done("OK"), 1000);
  },
  "location.reload": function(payload, done) {
    window.location.reload();
    window.setTimeout(() => {
      done("OK");
    }, 1000);
  },
  "location.wait": function(payload, done) {
    oneTimeSubscribe(this, (evt) => {
      done({old: evt.oldURL, new: evt.newURL});
    });
  }
};
