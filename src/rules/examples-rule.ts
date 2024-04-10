import { ContentDescriptorObject, ExampleObject, ExamplePairingObject, MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { ExampleCall, IOptions } from "../coverage";
import { isEqual } from "lodash";

const paramsToObj = (
  params: any[],
  methodParams: ContentDescriptorObject[]
): any => {
  return params.reduce((acc, val, i) => {
    acc[methodParams[i].name] = val;
    return acc;
  }, {});
};
class ExamplesRule {
  onBegin(options: IOptions, exampleCalls: ExampleCall[]) {}
  getExampleCalls(openrpcDocument: OpenrpcDocument, method: MethodObject): ExampleCall[] {
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
  onEnd(options: IOptions, exampleCalls: ExampleCall[]) {}

  // example call lifecycle
  beforeRequest(options: IOptions, exampleCall: ExampleCall) {}
  afterRequest(options: IOptions, exampleCall: ExampleCall) {}

  beforeResponse(options: IOptions, exampleCall: ExampleCall) {}
  afterResponse(options: IOptions, exampleCall: ExampleCall) {}
}

export default ExamplesRule;
