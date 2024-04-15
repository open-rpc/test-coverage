import { ContentDescriptorObject, MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { Call, IOptions } from "../coverage";
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
  numCalls?: number;
}
class JsonSchemaFakerRule implements Rule {
  private skip?: string[];
  private only?: string[];
  private numCalls: number;
  constructor(options?: RulesOptions) {
    this.skip = options?.skip;
    this.only = options?.only;
    this.numCalls = options?.numCalls || 5;
  }
  getTitle() {
    return "Generate params from json-schema-faker and expect results to match";
  }
  getCalls(openrpcDocument: OpenrpcDocument, method: MethodObject): Call[] {
    if (this.skip && this.skip.includes(method.name)) {
      return [];
    }
    if (this.only && this.only.length > 0 && !this.only.includes(method.name)) {
      return [];
    }
    const url = openrpcDocument.servers ? openrpcDocument.servers[0].url : "";
    const calls: Call[] = [];
    if (method.examples === undefined || method.examples.length === 0) {
      let callNumForParams = this.numCalls;
      if (method.params.length === 0) {
        callNumForParams = 1;
      }

      for (let i = 0; i < callNumForParams; i++) {
        const p = getFakeParams(method.params);
        // handle object or array case
        const params =
          method.paramStructure === "by-name"
            ? paramsToObj(p, method.params as ContentDescriptorObject[])
            : p;
        calls.push({
          title: this.getTitle() + "[" + i + "]",
          methodName: method.name,
          params,
          url,
          resultSchema: (method.result as ContentDescriptorObject).schema,
        });
      }
    }
    return calls;
  }
  validateCall(call: Call): Call {
    try {
      const ajv = new Ajv();
      ajv.validate(call.resultSchema, call.result);
      if (ajv.errors && ajv.errors.length > 0) {
        call.valid = false;
        call.reason = JSON.stringify(ajv.errors);
      } else {
        call.valid = true;
      }
    } catch (e: any) {
      call.valid = false;
      call.reason = e.message;
    }
    return call;
  }
}

export default JsonSchemaFakerRule;
