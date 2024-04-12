
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
    const calls = rule.getExampleCalls(openrpcDocument, openrpcDocument.methods[0]);
    calls[0].result = true;
    const result = rule.validateExampleCall(calls[0]);
    expect(result.valid).toBe(true);
  });
  it("should handle errors within ajv when validating", () => {
    const rule = new JsonSchemaFakerRule();
    const exampleCall = {
      title: 'test call',
      methodName: "foo",
      params: [],
      url: "http://localhost:3333",
      resultSchema: {
        type: "boolean",
        unevaluatedProperties: false,
      },
    };
    const result = rule.validateExampleCall(exampleCall);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch('unknown keyword: "unevaluatedProperties"');
  });
});
