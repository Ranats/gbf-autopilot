import { assert } from "chai";
import ConfigWrapper from "../../src/lib/ConfigWrapper";

describe("Config wrapper test", () => {
  it("should destructure dot keys", () => {
    const config = {
      "a.b.c": "d",
      u: {
        "v.w": 0
      },
      x: {
        y: "z"
      }
    };

    const wrapper = new ConfigWrapper(config);

    assert.isObject(wrapper.get("a"), "a should be an object");
    assert.isObject(wrapper.get("a.b"), "a.b should be an object");
    assert.equal("d", wrapper.get("a.b.c"), "a.b.c should be d");
    assert.equal("d", wrapper.get("a").b.c, "{a}.b.c should be d");

    assert.isObject(wrapper.get("u"), "u should be an object");
    assert.isObject(wrapper.get("u.v"), "u.v should be an object");
    assert.equal(0, wrapper.get("u.v.w"), "u.v.w should be 0");
    assert.equal(0, wrapper.get("u").v.w, "{u}.v.w should be 0");

    assert.isObject(wrapper.get("x"), "x should be an object");
    assert.equal("z", wrapper.get("x.y"), "x.y should be z");
    assert.equal("z", wrapper.get("x").y, "{x}.y should be z");

    wrapper.set("a", "bcd");
    assert.isNull(wrapper.get("a.b.c"), "a.b.c should be null");
    assert.equal("bcd", wrapper.get("a"), "a.b should be cd");

    wrapper.set("u.a.b.c", true);
    assert.isTrue(wrapper.get("u.a.b.c"));

    const object = wrapper.toObject();
    assert.equal("bcd", object.a);
    assert.equal(0, object.u.v.w);
    assert.isTrue(object.u.a.b.c);
  });
});
