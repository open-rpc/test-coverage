import coverage, { ExampleCall, IOptions } from "./coverage";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import EmptyReporter from "./reporters/emptyReporter";
import ConsoleReporter from "./reporters/console";

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
            }
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
            value: true,
          },
        },
      ],
    },
  ],
} as OpenrpcDocument;

describe("coverage", () => {
  describe("reporter", () => {
    it("can call the reporter", (done) => {
      class CustomReporter {
        onBegin() {}
        onTestBegin() {}
        onTestEnd() {}
        onEnd() {
          done();
        }
      }
      const transport = () => Promise.resolve();
      coverage({
        reporters: [new CustomReporter()],
        transport,
        openrpcDocument: mockSchema,
        skip: [],
        only: [],
      });
    });
    it("can call the reporter with the results", (done) => {
      class CustomReporter {
        onBegin() {}
        onTestBegin() {}
        onTestEnd() {}
        onEnd(options: IOptions, exampleCalls: ExampleCall[]) {
          expect(exampleCalls[0].result).toBe(true);
          done();
        }
      }
      const transport = async (url: string, method: string, params: any[]) => {
        return { result: true };
      };
      coverage({
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
      const reporter = new class CustomReporter {
        onBegin() {}
        onTestBegin() {}
        onTestEnd() {}
        onEnd() {}
      };
      const spy = jest.spyOn(reporter, "onTestBegin");
      const transport = () => Promise.resolve({});
      const openrpcDocument = mockSchema;
      const options = {
        reporters: [reporter],
        transport,
        openrpcDocument,
        skip: ['foo', 'bar', 'baz'],
        only: [],
      };

      await expect(coverage(options)).rejects.toThrow('No methods to test');
    });
    it("can get to expectedResult checking with no servers", async () => {
      const reporter = new class CustomReporter {
        onBegin() {}
        onTestBegin() {}
        onTestEnd() {}
        onEnd() {}
      };
      const spy = jest.spyOn(reporter, "onTestBegin");
      const transport = () => Promise.resolve({});
      const openrpcDocument = {...mockSchema};
      openrpcDocument.servers = undefined;
      const options = {
        reporters: [reporter],
        transport,
        openrpcDocument,
        skip: [],
        only: ['baz'],
      };

      await expect(coverage(options)).resolves.toBeDefined();
    });
  });
  describe("transport", () => {
    it("can call the transport", (done) => {
      const transport = () => {
        done();
        return Promise.resolve({});
      };
      coverage({
        reporters: [new EmptyReporter()],
        transport,
        openrpcDocument: mockSchema,
        skip: [],
        only: [],
      });
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

      reporter.onBegin = jest.fn();
      await coverage(options);
      expect(reporter.onBegin).toHaveBeenCalled();
    });
    it("onTestBegin is called",  async () => {
      const reporter = new class CustomReporter {
        onBegin() {}
        onTestBegin() {}
        onTestEnd() {}
        onEnd() {}
      };
      const spy = jest.spyOn(reporter, "onTestBegin");
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
      expect(spy).toHaveBeenCalledTimes(12);
    });
    it("can handle multiple reporters", async () => {
      const reporter = new EmptyReporter();
      const reporter2 = new EmptyReporter();
      const transport = () => Promise.resolve({});
      const openrpcDocument = mockSchema;

      const onBeginSpy = jest.spyOn(reporter, "onBegin");
      const onTestBeginSpy = jest.spyOn(reporter, "onTestBegin");
      const onTestEndSpy = jest.spyOn(reporter, "onTestEnd");
      const onEndSpy = jest.spyOn(reporter, "onEnd");

      const onBeginSpy2 = jest.spyOn(reporter2, "onBegin");
      const onTestBeginSpy2 = jest.spyOn(reporter2, "onTestBegin");
      const onTestEndSpy2 = jest.spyOn(reporter2, "onTestEnd");
      const onEndSpy2 = jest.spyOn(reporter2, "onEnd");

      const options = {
        reporters: [reporter, reporter2],
        transport,
        openrpcDocument,
        skip: [],
        only: [],
      };
      await coverage(options);

      expect(onBeginSpy).toHaveBeenCalledTimes(1);
      expect(onTestBeginSpy).toHaveBeenCalledTimes(12);
      expect(onTestEndSpy).toHaveBeenCalledTimes(12);
      expect(onEndSpy).toHaveBeenCalledTimes(1);

      expect(onBeginSpy2).toHaveBeenCalledTimes(1);
      expect(onTestBeginSpy2).toHaveBeenCalledTimes(12);
      expect(onTestEndSpy2).toHaveBeenCalledTimes(12);
      expect(onEndSpy2).toHaveBeenCalledTimes(1);
    })
  });
});
