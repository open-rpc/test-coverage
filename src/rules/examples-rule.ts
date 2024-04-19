import { ContentDescriptorObject, ExampleObject, ExamplePairingObject, MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { Call, IOptions } from "../coverage";
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
  getTitle() {
    return "Generate params from examples and expect results to match"
  }
  getCalls(openrpcDocument: OpenrpcDocument, method: MethodObject): Call[] {
    if (this.skip && this.skip.includes(method.name)) {
      return [];
    }
    if (this.only && this.only.length > 0 && !this.only.includes(method.name)) {
      return [];
    }
    const calls: Call[] = [];
    if (method.examples) {
      (method.examples as ExamplePairingObject[]).forEach((ex) => {
        const p = (ex.params as ExampleObject[]).map((e) => e.value);
        const params =
          method.paramStructure === "by-name"
            ? paramsToObj(p, method.params as ContentDescriptorObject[])
            : p;
        calls.push({
          title:
            this.getTitle() + " " +
            ex.name,
          methodName: method.name,
          params,
          url: openrpcDocument.servers?.[0].url || "",
          resultSchema: (method.result as ContentDescriptorObject).schema,
          expectedResult: (ex.result as ExampleObject).value,
        });
      });
    }
    return calls;
  }
  validateCall(call: Call): Call {
    if (call.expectedResult !== undefined && call.result !== undefined) {
      call.valid = isEqual(
        call.expectedResult,
        call.result
      );
      if (!call.valid) {
        call.reason = `expected ${JSON.stringify(call.expectedResult)} but got ${JSON.stringify(call.result)}`;
      }
    }
    return call;
  }
}

export default ExamplesRule;
