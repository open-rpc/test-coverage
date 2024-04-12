import { ContentDescriptorObject, MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { ExampleCall, IOptions } from "../coverage";
import Ajv from "ajv";
import Rule from "./rule";
import paramsToObj from "../utils/params-to-obj";

const jsf = require("json-schema-faker"); // tslint:disable-line

const getFakeParams = (params: any[]): any[] => {
  return params.map((p) => jsf.generate(p.schema));
};

interface RulesOptions {
  skip: string[];
  only: string[];
}
class JsonSchemaFakerRule implements Rule {
  private skip?: string[];
  private only?: string[];
  constructor(options?: RulesOptions) {
    this.skip = options?.skip;
    this.only = options?.only;
  }
  getExampleCalls(openrpcDocument: OpenrpcDocument, method: MethodObject): ExampleCall[] {
    if (this.skip && this.skip.includes(method.name)) {
      return [];
    }
    if (this.only && this.only.length > 0 && !this.only.includes(method.name)) {
      return [];
    }
    const url = openrpcDocument.servers ? openrpcDocument.servers[0].url : "";
    const exampleCalls: ExampleCall[] = [];
    if (method.examples === undefined || method.examples.length === 0) {
      for (let i = 0; i < 10; i++) {
        const p = getFakeParams(method.params);
        // handle object or array case
        const params =
          method.paramStructure === "by-name"
            ? paramsToObj(p, method.params as ContentDescriptorObject[])
            : p;
        exampleCalls.push({
          title: method.name + " > json-schema-faker params and expect result schema to match [" + i + "]",
          methodName: method.name,
          params,
          url,
          resultSchema: (method.result as ContentDescriptorObject).schema,
        });
      }
    }
    return exampleCalls;
  }
  validateExampleCall(exampleCall: ExampleCall): ExampleCall {
    try {
      const ajv = new Ajv();
      ajv.validate(exampleCall.resultSchema, exampleCall.result);
      if (ajv.errors && ajv.errors.length > 0) {
        exampleCall.valid = false;
        exampleCall.reason = JSON.stringify(ajv.errors);
      } else {
        exampleCall.valid = true;
      }
    } catch (e: any) {
      exampleCall.valid = false;
      exampleCall.reason = e.message;
    }
    return exampleCall;
  }
}

export default JsonSchemaFakerRule;
