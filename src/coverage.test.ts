import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import coverage, { Call, IOptions } from "./coverage";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import EmptyReporter from "./reporters/emptyReporter";
import Rule from "./rules/rule";
import ExamplesRule from "./rules/examples-rule";
import JsonSchemaFakerRule from "./rules/json-schema-faker-rule";

const mockSchema = {
  openrpc: "1.0.0",
  info: {
    title: "my api",
    version: "0.0.0-development",
  },
  servers: [
    {
      name: "my api",
      url: "http://localhost:3333",
    },
  ],
  methods: [
    {
      name: "foo",
      params: [],
      result: {
        name: "fooResult",
        schema: {
          type: "boolean",
        },
      },
    },
    {
      name: "bar",
      paramStructure: "by-name",
      params: [
        {
          name: "barParam",
          required: true,
          schema: {
            type: "string",
            enum: ["bar"],
          },
        },
        {
          name: "barParam2",
          schema: {
            type: "string",
          },
        },
      ],
      result: {
        name: "barResult",
        schema: {
          type: "boolean",
        },
      },
      examples: [
        {
          name: "fooExample",
          summary: "foo example",
          description: "this is an example of foo",
          params: [
            {
              name: "barParam",
              value: "bar",
            },
            {
              name: "barParam2",
              value: "bar",
            },
          ],
          result: {
            name: "fooResult",
            schema: {
              type: "boolean",
            },
          },
        },
      ],
    },
    {
      name: "baz",
      params: [
        {
          name: "bazParam",
          required: true,
          schema: {
            type: "string",
            enum: ["baz"],
          },
        },
        {
          name: "bazParam2",
          schema: {
            type: "string",
          },
        },
      ],
      result: {
        name: "bazResult",
        schema: {
          type: "boolean",
        },
      },
      examples: [
        {
          name: "fooExample",
          summary: "foo example",
          description: "this is an example of foo",
          params: [],
          result: {
            name: "fooResult",
            value: false,
          },
        },
      ],
    },
  ],
} as OpenrpcDocument;

afterEach(() => {
  mock.restore();
});

describe("coverage", () => {
  describe("rules", () => {
    it("can call multiple rules with different async or sync lifecycle functions", async () => {
      const reporter = new EmptyReporter();
      const transport = () => Promise.resolve({});
      const openrpcDocument = mockSchema;
      const exampleRule = new ExamplesRule({ skip: ["foo"], only: ["baz"] });
      const jsonSchemaFakerRule = new JsonSchemaFakerRule({ skip: ["baz"], only: [] });
      const jsonSchemaFakerRule2 = new JsonSchemaFakerRule({
        skip: [],
        only: ["foo", "bar"],
      });
      class MyCustomRule implements Rule {
        getTitle(): string {
          return "My custom rule";
        }
        getCalls(openrpcDocument: OpenrpcDocument, method: any) {
          return [];
        }
        async validateCall(call: Call) {
          return call;
        }
      }
      const myCustomRule = new MyCustomRule();

      const getCallsSpy = spyOn(exampleRule, "getCalls");
      const getCallsCustomSpy = spyOn(
        myCustomRule,
        "getCalls"
      );
      const getCallsJsonSchemaFakerSpy = spyOn(
        jsonSchemaFakerRule,
        "getCalls"
      );
      const options = {
        reporters: [reporter],
        rules: [exampleRule, myCustomRule, jsonSchemaFakerRule, jsonSchemaFakerRule2],
        transport,
        openrpcDocument,
        skip: [],
        only: [],
      };
      await coverage(options);
      expect(getCallsSpy).toHaveBeenCalled();
      expect(getCallsCustomSpy).toHaveBeenCalled();
      expect(getCallsJsonSchemaFakerSpy).toHaveBeenCalled();
    });
  });
  describe("reporter", () => {
    it("can call the reporter", async () => {
      class CustomReporter {
        onBegin() {}
        onTestBegin() {}
        onTestEnd() {}
        onEnd() {}
      }
      const reporter = new CustomReporter();
      const onEndSpy = spyOn(reporter, "onEnd");
      const transport = () => Promise.resolve();
      await coverage({
        reporters: [reporter],
        transport,
        openrpcDocument: mockSchema,
        skip: [],
        only: [],
      });
      expect(onEndSpy).toHaveBeenCalledTimes(1);
    });
    it("can call the reporter with the results", async () => {
      expect.assertions(1);
      class CustomReporter {
        onBegin() {}
        onTestBegin() {}
        onTestEnd() {}
        onEnd(options: IOptions, calls: Call[]) {
          expect(calls[0].result).toBe(true);
        }
      }
      const transport = async (url: string, method: string, params: any[]) => {
        return { result: true };
      };
      await coverage({
        reporters: [new CustomReporter()],
        transport,
        openrpcDocument: mockSchema,
        skip: [],
        only: [],
      });
    });
  });
  describe("coverage tests", () => {
    it("throws an error when there are no methods", async () => {
      const reporter = new (class CustomReporter {
        onBegin() {}
        onTestBegin() {}
        onTestEnd() {}
        onEnd() {}
      })();
      const transport = () => Promise.resolve({});
      const openrpcDocument = mockSchema;
      const options = {
        reporters: [reporter],
        transport,
        openrpcDocument,
        skip: ["foo", "bar", "baz"],
        only: [],
      };

      await expect(coverage(options)).rejects.toThrow("No methods to test");
    });
    it("can get to expectedResult checking with no servers", async () => {
      const reporter = new class CustomReporter {
        onBegin() {}
        onTestBegin() {}
        onTestEnd() {}
        onEnd() {}
      };
      const transport = () => Promise.resolve({});
      const openrpcDocument = { ...mockSchema };
      openrpcDocument.servers = undefined;
      const options = {
        reporters: [reporter],
        transport,
        openrpcDocument,
        skip: [],
        only: ["baz"],
      };

      await expect(coverage(options)).resolves.toBeDefined();
    });
  });
  describe("transport", () => {
    it("can call the transport", async () => {
      const transport = mock();
      await coverage({
        reporters: [new EmptyReporter()],
        transport,
        openrpcDocument: {
          openrpc: "1.2.6",
          info: { title: "f", version: "0.0.0" },
          methods: [mockSchema.methods[0]],
        },
        skip: [],
        only: [],
      });
      await expect(transport).toHaveBeenCalled();
    });
  });
  describe("reporter more tests", () => {
    // reporter integration tests
    it("onBegin is called", async () => {
      // this is a test that the reporter is called
      const reporter = new EmptyReporter();
      const transport = () => Promise.resolve({});
      const openrpcDocument = mockSchema;
      const options = {
        reporters: [reporter],
        transport,
        openrpcDocument,
        skip: [],
        only: [],
      };

      reporter.onBegin = mock();
      await coverage(options);
      expect(reporter.onBegin).toHaveBeenCalled();
    });
    it("onTestBegin is called", async () => {
      const reporter = new (class CustomReporter {
        onBegin() {}
        onTestBegin() {}
        onTestEnd() {}
        onEnd() {}
      })();
      const spy = spyOn(reporter, "onTestBegin");
      const transport = () => Promise.resolve({});
      const openrpcDocument = mockSchema;
      const options = {
        reporters: [reporter],
        transport,
        openrpcDocument,
        skip: [],
        only: [],
      };

      await coverage(options);
      expect(spy).toHaveBeenCalledTimes(3);
    });
    it("can handle multiple reporters", async () => {
      const reporter = new EmptyReporter();
      const reporter2 = new EmptyReporter();
      const transport = () => Promise.resolve({});
      const openrpcDocument = mockSchema;

      const onBeginSpy = spyOn(reporter, "onBegin");
      const onTestBeginSpy = spyOn(reporter, "onTestBegin");
      const onTestEndSpy = spyOn(reporter, "onTestEnd");
      const onEndSpy = spyOn(reporter, "onEnd");

      const onBeginSpy2 = spyOn(reporter2, "onBegin");
      const onTestBeginSpy2 = spyOn(reporter2, "onTestBegin");
      const onTestEndSpy2 = spyOn(reporter2, "onTestEnd");
      const onEndSpy2 = spyOn(reporter2, "onEnd");

      const options = {
        reporters: [reporter, reporter2],
        transport,
        openrpcDocument,
        skip: [],
        only: [],
      };
      await coverage(options);

      expect(onBeginSpy).toHaveBeenCalledTimes(1);
      expect(onTestBeginSpy).toHaveBeenCalledTimes(3);
      expect(onTestEndSpy).toHaveBeenCalledTimes(3);
      expect(onEndSpy).toHaveBeenCalledTimes(1);

      expect(onBeginSpy2).toHaveBeenCalledTimes(1);
      expect(onTestBeginSpy2).toHaveBeenCalledTimes(3);
      expect(onTestEndSpy2).toHaveBeenCalledTimes(3);
      expect(onEndSpy2).toHaveBeenCalledTimes(1);
    });
  });
});
