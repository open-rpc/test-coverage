import { ExampleCall, IOptions } from "../coverage";

interface Reporter {
  onBegin(options: IOptions, exampleCalls: ExampleCall[]): void;
  onTestBegin(options: IOptions, exampleCall: ExampleCall): void;
  onTestEnd(options: IOptions, exampleCall: ExampleCall): void;
  onEnd(options: IOptions, exampleCalls: ExampleCall[]): void;
}

export default Reporter;
