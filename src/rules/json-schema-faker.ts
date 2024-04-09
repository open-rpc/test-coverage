import { ExampleCall, IOptions } from "../coverage";
import Rules from "./rules";

class JsonSchemaRules implements Rules {
  onBegin(options: IOptions, exampleCalls: ExampleCall[]) {}
  getExampleCalls(): ExampleCall[] {
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

export default Rules;
