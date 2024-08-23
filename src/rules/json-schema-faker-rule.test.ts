
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
    const Call = {
      title: 'test call',
      methodName: "foo",
      params: [],
      url: "http://localhost:3333",
      resultSchema: {
        type: "boolean",
        unevaluatedProperties: false,
      },
    };
    const result = rule.validateCall(Call);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch('unknown keyword: "unevaluatedProperties"');
  });
  it("should produce a readable error for reason", () => {
    const rule = new JsonSchemaFakerRule();
    const Call = {
      title: 'test call',
      methodName: "foo",
      params: [],
      url: "http://localhost:3333",
      resultSchema: {
        type: "boolean",
      },
      result: "potato",
    };
    const result = rule.validateCall(Call);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('expected:\n "potato"');
    expect(result.reason).toContain('  to match schema: \n{\n  "type":"boolean"\n}');
  });
});
