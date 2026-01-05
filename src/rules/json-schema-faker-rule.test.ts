
import { Call } from "../coverage";
import JsonSchemaFakerRule from "./json-schema-faker-rule";

describe("JsonSchemaFakerRule", () => {
  it("should validate example calls", () => {
    const rule = new JsonSchemaFakerRule();
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
          paramStructure: "by-name",
          result: {
            name: "fooResult",
            schema: {
              type: "boolean",
            },
          },
        },
      ],
    } as any;
    const calls = rule.getCalls(openrpcDocument, openrpcDocument.methods[0]);
    calls[0].result = true;
    const result = rule.validateCall(calls[0]);
    expect(result.valid).toBe(true);
  });
  it("should handle errors within ajv when validating", () => {
    const rule = new JsonSchemaFakerRule();
    const call: Call = {
      title: 'test call',
      methodName: "foo",
      params: [],
      url: "http://localhost:3333",
      resultSchema: {
        type: "boolean",
        unevaluatedProperties: false,
      },
    };
    const result = rule.validateCall(call);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch('unknown keyword: "unevaluatedProperties"');
  });
  it("should produce a readable error for reason", () => {
    const rule = new JsonSchemaFakerRule();
    const call: Call = {
      title: 'test call',
      methodName: "foo",
      params: [],
      url: "http://localhost:3333",
      resultSchema: {
        type: "boolean",
      },
      result: "potato",
    };
    const result = rule.validateCall(call);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('expected:\n "potato"');
    expect(result.reason).toContain('to match schema:');
    expect(result.reason).toContain(JSON.stringify(call.resultSchema, null, 2));
  });
  it("returns no calls when the method is skipped", () => {
    const rule = new JsonSchemaFakerRule({ skip: ["foo"], only: [] });
    const openrpcDocument = {
      openrpc: "1.0.0",
      info: {
        title: "my api",
        version: "0.0.0-development",
      },
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
    } as any;

    const calls = rule.getCalls(openrpcDocument, openrpcDocument.methods[0]);
    expect(calls).toEqual([]);
  });
  it("returns no calls when the method is not in the only list", () => {
    const rule = new JsonSchemaFakerRule({ skip: [], only: ["bar"] });
    const openrpcDocument = {
      openrpc: "1.0.0",
      info: {
        title: "my api",
        version: "0.0.0-development",
      },
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
    } as any;

    const calls = rule.getCalls(openrpcDocument, openrpcDocument.methods[0]);
    expect(calls).toEqual([]);
  });
  it("skips methods that define examples", () => {
    const rule = new JsonSchemaFakerRule();
    const openrpcDocument = {
      openrpc: "1.0.0",
      info: {
        title: "my api",
        version: "0.0.0-development",
      },
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
          examples: [
            {
              name: "example",
              params: [],
              result: {
                name: "fooResult",
                value: true,
              },
            },
          ],
        },
      ],
    } as any;

    const calls = rule.getCalls(openrpcDocument, openrpcDocument.methods[0]);
    expect(calls).toEqual([]);
  });
  it("uses array params when paramStructure is not by-name", () => {
    const rule = new JsonSchemaFakerRule({ skip: [], only: [], numCalls: 2 });
    const openrpcDocument = {
      openrpc: "1.0.0",
      info: {
        title: "my api",
        version: "0.0.0-development",
      },
      methods: [
        {
          name: "foo",
          params: [
            {
              name: "fooParam",
              schema: {
                type: "string",
              },
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
    } as any;

    const calls = rule.getCalls(openrpcDocument, openrpcDocument.methods[0]);
    expect(calls).toHaveLength(2);
    expect(Array.isArray(calls[0].params)).toBe(true);
  });
});
