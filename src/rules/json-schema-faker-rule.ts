import { ContentDescriptorObject, MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { ExampleCall, IOptions } from "../coverage";
import Ajv from "ajv";

const jsf = require("json-schema-faker"); // tslint:disable-line

const getFakeParams = (params: any[]): any[] => {
  return params.map((p) => jsf.generate(p.schema));
};

const paramsToObj = (
  params: any[],
  methodParams: ContentDescriptorObject[]
): any => {
  return params.reduce((acc, val, i) => {
    acc[methodParams[i].name] = val;
    return acc;
  }, {});
};

class JsonSchemaFakerRule {
  onBegin(options: IOptions, exampleCalls: ExampleCall[]) {}
  getExampleCalls(openrpcDocument: OpenrpcDocument, method: MethodObject): ExampleCall[] {
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
    const ajv = new Ajv();
    ajv.validate(exampleCall.resultSchema, exampleCall.result);
    if (ajv.errors && ajv.errors.length > 0) {
      exampleCall.valid = false;
      exampleCall.reason = JSON.stringify(ajv.errors);
    } else {
      exampleCall.valid = true;
    }
    exampleCall.valid = true;
    return exampleCall;
  }
  onEnd(options: IOptions, exampleCalls: ExampleCall[]) {}

  // example call lifecycle
  beforeRequest(options: IOptions, exampleCall: ExampleCall) {}
  afterRequest(options: IOptions, exampleCall: ExampleCall) {}

  beforeResponse(options: IOptions, exampleCall: ExampleCall) {}
  afterResponse(options: IOptions, exampleCall: ExampleCall) {}
}

export default JsonSchemaFakerRule;
