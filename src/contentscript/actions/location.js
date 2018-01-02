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
    done("OK"); // need to be called first since the contentscript can't respond after reloading
    window.location.reload();
  },
};
