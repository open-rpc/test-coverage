import { ContentDescriptorObject, ExampleObject, ExamplePairingObject, MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { ExampleCall, IOptions } from "../coverage";
import { isEqual } from "lodash";
import Rule from "./rule";
import paramsToObj from "../utils/params-to-obj";

interface RulesOptions {
  skip: string[];
  only: string[];
}

class ExamplesRule implements Rule {
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
    const exampleCalls: ExampleCall[] = [];
    if (method.examples) {
      (method.examples as ExamplePairingObject[]).forEach((ex) => {
        const p = (ex.params as ExampleObject[]).map((e) => e.value);
        const params =
          method.paramStructure === "by-name"
            ? paramsToObj(p, method.params as ContentDescriptorObject[])
            : p;
        exampleCalls.push({
          title:
            method.name +
            " > example params and expect result to match: " +
            ex.name,
          methodName: method.name,
          params,
          url: "",
          resultSchema: (method.result as ContentDescriptorObject).schema,
          expectedResult: (ex.result as ExampleObject).value,
        });
      });
    }
    return exampleCalls;
  }
  validateExampleCall(exampleCall: ExampleCall): ExampleCall {
    if (exampleCall.expectedResult) {
      exampleCall.valid = isEqual(
        exampleCall.expectedResult,
        exampleCall.result
      );
    }
    return exampleCall;
  }
}

export default ExamplesRule;
