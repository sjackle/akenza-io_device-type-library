const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yanzi Motion Plus Sensor Uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
        temperatureSchema = parsedSchema;
        done();
      });
  });

  let humiditySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/humidity.schema.json`)
      .then((parsedSchema) => {
        humiditySchema = parsedSchema;
        done();
      });
  });

  let lightSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/light.schema.json`).then((parsedSchema) => {
      lightSchema = parsedSchema;
      done();
    });
  });

  let occupancySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yanzi Motion Plus Sensor Temperature payload", () => {
      const data = {
        data: {
          resourceType: "SampleList",
          dataSourceAddress: {
            resourceType: "DataSourceAddress",
            did: "EUI64-0080E10300050834-3-Temp",
            locationId: "312770",
            serverDid: "EUI64-0090DAFFFF007A30",
            variableName: {
              resourceType: "VariableName",
              name: "temperatureK",
            },
            instanceNumber: 0,
          },
          list: [
            {
              resourceType: "SampleTemp",
              sampleTime: 1643364139738,
              value: 292.1,
            },
          ],
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 29.21);

        validate(value.data, temperatureSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yanzi Motion Plus Sensor Humidity payload", () => {
      const data = {
        data: {
          resourceType: "SampleList",
          dataSourceAddress: {
            resourceType: "DataSourceAddress",
            did: "EUI64-0080E10300050834-3-Humd",
            locationId: "312770",
            serverDid: "EUI64-0090DAFFFF007A30",
            variableName: {
              resourceType: "VariableName",
              name: "relativeHumidity",
            },
            instanceNumber: 0,
          },
          list: [
            {
              resourceType: "SampleHumidity",
              sampleTime: 1643364139747,
              value: 38.3,
            },
          ],
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 38.3);

        validate(value.data, humiditySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yanzi Motion Plus Sensor Motion payload", () => {
      const data = {
        data: {
          resourceType: "SampleList",
          dataSourceAddress: {
            resourceType: "DataSourceAddress",
            did: "EUI64-D0CF5EFFFE59E7B5-3-Motion",
            locationId: "312770",
            serverDid: "EUI64-0090DAFFFF007A30",
            variableName: {
              resourceType: "VariableName",
              name: "motion",
            },
            instanceNumber: 0,
          },
          list: [
            {
              resourceType: "SampleMotion",
              sampleTime: 1643365120931,
              value: 7875,
              timeLastMotion: 1643365120931,
            },
          ],
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.motion, 7875);
        assert.equal(value.data.occupancy, 1);

        validate(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yanzi Motion Plus Sensor Light payload", () => {
      const data = {
        data: {
          resourceType: "SampleList",
          dataSourceAddress: {
            resourceType: "DataSourceAddress",
            did: "EUI64-0080E10300050834-5-Illuminance",
            locationId: "312770",
            serverDid: "EUI64-0090DAFFFF007A30",
            variableName: {
              resourceType: "VariableName",
              name: "illuminance",
            },
            instanceNumber: 0,
          },
          list: [
            {
              resourceType: "SampleIlluminance",
              sampleTime: 1643364139759,
              value: 88320,
              colorTemperature: 7518,
            },
          ],
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "light");
        assert.equal(value.data.light, 88.3);
        assert.equal(value.data.colorTemperature, 7518);

        validate(value.data, lightSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
