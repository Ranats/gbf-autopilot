const serverRunner = require("../server");

describe("Test server dry run", () => {
  it("should listen normally", function(done) {
    this.timeout(5000);
    serverRunner().then((server) => {
      server.close(done);
    });
  });
});
