const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("FTD Network tester", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let gpsSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the FTD Network payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "be1a47248480008320601512100da1",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.66);
        assert.equal(value.data.batteryLevel, 0);
        assert.equal(value.data.deviceStatusFlag, 0);

        validate(value.data, gpsSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.currentLevel, 2.9);
        assert.equal(value.data.isEmptying, false);
        assert.equal(value.data.isTanking, false);
        assert.equal(value.data.hasMeasurementError, false);
        assert.equal(value.data.hasOutOfRangeError, true);
        assert.equal(value.data.sequenceNumber, 2);
        assert.equal(value.data.temperature, 23);
        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
