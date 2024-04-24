
import ExamplesRule from "./examples-rule";

describe("ExamplesRule", () => {
  it("should validate example calls with ajv as the fallback", () => {
    const rule = new ExamplesRule();
    const openrpcDocument = {
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
              type: "string",
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
                value: "potato",
              }
            }
          ]
        },
      ],
    } as any;
    const calls = rule.getCalls(openrpcDocument, openrpcDocument.methods[0]);
    calls[0].result = "different";
    const result = rule.validateCall(calls[0]);
    expect(result.valid).toBe(true);
  });
  it("should not validate example calls with ajv as a callback", () => {
    const rule = new ExamplesRule();
    const openrpcDocument = {
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
              type: "string",
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
                value: "potato",
              }
            }
          ]
        },
      ],
    } as any;
    const calls = rule.getCalls(openrpcDocument, openrpcDocument.methods[0]);
    calls[0].result = false;
    const result = rule.validateCall(calls[0]);
    expect(result.valid).toBe(false);
  });
  it("should not validate example calls with ajv as a callback and just give a good error message if the schema doesnt parse", () => {
    const rule = new ExamplesRule();
    const openrpcDocument = {
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
              type: "string",
              unevaluatedProperties: false,
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
                value: "potato",
              }
            }
          ]
        },
      ],
    } as any;
    const calls = rule.getCalls(openrpcDocument, openrpcDocument.methods[0]);
    calls[0].result = false;
    const result = rule.validateCall(calls[0]);
    expect(result.valid).toBe(false);
  });
});
