import coverage, { ExampleCall, IOptions } from "./coverage";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import EmptyReporter from "./reporters/emptyReporter";

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
          params: [],
          result: {
            name: "fooResult",
            schema: {
              type: "boolean",
            },
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
        reporter: new CustomReporter(),
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
        reporter: new CustomReporter(),
        transport,
        openrpcDocument: mockSchema,
        skip: [],
        only: [],
      });
    });
  });
  describe("transport", () => {
    it("can call the transport", (done) => {
      const transport = () => {
        done();
        return Promise.resolve({});
      };
      coverage({
        reporter: new EmptyReporter(),
        transport,
        openrpcDocument: mockSchema,
        skip: [],
        only: [],
      });
    });
  });
});
