import { ExampleCall, IOptions } from '../coverage';
import Reporter from './reporter';

class RawReporter implements Reporter {
  onBegin(options: IOptions, exampleCalls: ExampleCall[]) {}
  onTestBegin(options: IOptions, exampleCall: ExampleCall) {}

  onTestEnd(options: IOptions, exampleCall: ExampleCall) {}

  onEnd(options: IOptions, exampleCalls: ExampleCall[]) {
    return exampleCalls;
  }
}

export default RawReporter;
