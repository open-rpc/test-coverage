import { MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { ExampleCall, IOptions } from "../coverage";

class Rule {
  onBegin(options: IOptions, exampleCalls: ExampleCall[]) {}
  getExampleCalls(openrpcDocument: OpenrpcDocument, method: MethodObject): ExampleCall[] {
    return [];
  }
  validateExampleCall(exampleCall: ExampleCall): ExampleCall {
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

export default Rule;
