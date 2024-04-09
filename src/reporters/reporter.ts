import { ExampleCall, IOptions } from "../coverage";

abstract class Reporter {
  onBegin(options: IOptions, exampleCalls: ExampleCall[]) {}
  onTestBegin(options: IOptions, exampleCall: ExampleCall) {}
  onTestEnd(options: IOptions, exampleCall: ExampleCall) {}
  onEnd(options: IOptions, exampleCalls: ExampleCall[]) {}
}

export default Reporter;
