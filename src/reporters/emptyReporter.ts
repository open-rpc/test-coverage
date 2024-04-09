import { ExampleCall, IOptions } from '../coverage';
import Reporter from './reporter';

class EmptyReporter extends Reporter {
  onBegin(options: IOptions, exampleCalls: ExampleCall[]) {
    console.log(`Starting the run with ${exampleCalls.length} tests`);
  }

  onTestBegin(options: IOptions, exampleCall: ExampleCall) {
  }

  onTestEnd(options: IOptions, exampleCall: ExampleCall) {
    console.log(`Finished test ${exampleCall.title}: ${exampleCall.valid ? "success" : "error"}`);
  }

  onEnd(options: IOptions, exampleCalls: ExampleCall[]) {
    const failed = exampleCalls.filter((ec) => !ec.valid);
    const passed = exampleCalls.filter((ec) => ec.valid);
    console.log(`Finished the running ${exampleCalls.length} tests: ${failed.length} failed, ${passed.length} passed`);
  }
}

export default EmptyReporter;
