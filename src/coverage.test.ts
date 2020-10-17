import coverage from "./coverage";
import { OpenrpcDocument } from "@open-rpc/meta-schema";

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
  ],
} as OpenrpcDocument;

describe("coverage", () => {
  describe("reporter", () => {
    it("can call the reporter", (done) => {
      const reporter = (callResults: any[], schema: OpenrpcDocument) => {
        done();
      };
      const transport = () => Promise.resolve();
      coverage({
        reporter,
        transport,
        openrpcDocument: mockSchema,
        skipMethods: [],
      });
    });
    it("can call the reporter with the results", (done) => {
      const reporter = (callResults: any[], schema: OpenrpcDocument) => {
        expect(callResults[0].result.foo).toBe("bar");
        done();
      };
      const transport = (url: string, method: string, params: any[]) => {
        return Promise.resolve({ result: { foo: "bar" } });
      };
      coverage({
        reporter,
        transport,
        openrpcDocument: mockSchema,
        skipMethods: [],
      });
    });
  });
  describe("transport", () => {
    it("can call the transport", (done) => {
      const reporter = () => {
        // empty reporter
      };
      const transport = () => {
        done();
        return Promise.resolve({});
      };
      coverage({
        reporter,
        transport,
        openrpcDocument: mockSchema,
        skipMethods: [],
      });
    });
  });
});
