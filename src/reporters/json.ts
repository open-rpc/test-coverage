import { ExampleCall, IOptions } from '../coverage';
import Reporter from './reporter';

class JsonReporter implements Reporter {
  onBegin(options: IOptions, exampleCalls: ExampleCall[]) {}
  onTestBegin(options: IOptions, exampleCall: ExampleCall) {}

  onTestEnd(options: IOptions, exampleCall: ExampleCall) {}

  onEnd(options: IOptions, exampleCalls: ExampleCall[]) {
    const failed = exampleCalls.filter((ec) => !ec.valid);

    const passed = exampleCalls.filter((ec) => ec.valid);

    console.log(JSON.stringify(exampleCalls, undefined, 4));
  }
}

export default JsonReporter;
