const serverRunner = require("../server");

describe("Test server dry run", () => {
  it("should listen normally", (done) => {
    serverRunner().then((server) => {
      server.close(done);
    });
  });
});
