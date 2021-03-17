const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let defaultSchema = null;
let lifecycleSchema = null;

const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(
    __dirname + "/default.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      defaultSchema = JSON.parse(fileContents);
      done();
    }
  );
});

before(function (done) {
  fs.readFile(
    __dirname + "/lifecycle.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      lifecycleSchema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("TBClimate uplink", function () {
  describe("consume()", function () {
    it("should decode TBClimate payload", function () {
      const data = {
        data: {
          payload_hex: "000b361d350200003c0035",
        },
      };

      expectEmit(function (type, value) {
        if (type === "sample") {
          assert.equal(type, "sample");
          assert.isNotNull(value);
          assert.typeOf(value.data, "object");

          if (value.topic === "lifecycle") {
            assert.equal(value.data.voltage, 2.5);
            assert.equal(value.data.statusPercent, 73);

            validate(value.data, lifecycleSchema, { throwError: true });
          }

          if (value.topic === "default") {
            assert.equal(value.data.open, false);
            assert.equal(value.data.temperature, 22);
            assert.equal(value.data.humidity, 29);
            assert.equal(value.data.co2, 565);
            assert.equal(value.data.voc, 0);

            validate(value.data, defaultSchema, { throwError: true });
          }
        }
      });

      consume(data);
    });
  });
});
