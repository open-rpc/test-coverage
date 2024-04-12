
import JsonSchemaFakerRule from "./json-schema-faker-rule";

describe("JsonSchemaFakerRule", () => {
  it("should validate example calls", () => {
    const rule = new JsonSchemaFakerRule();
    const exampleCall = {
      title: 'test call',
      methodName: "foo",
      params: [],
      url: "http://localhost:3333",
      resultSchema: {
        type: "boolean",
      },
      result: true,
    };
    const result = rule.validateExampleCall(exampleCall);
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
