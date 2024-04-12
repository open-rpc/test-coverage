import { Call, IOptions } from '../coverage';
import Reporter from './reporter';

class EmptyReporter implements Reporter {
  onBegin(options: IOptions, Calls: Call[]) {
    console.log(`Starting the run with ${Calls.length} tests`);
  }

  onTestBegin(options: IOptions, Call: Call) {
    console.log(`started test ${Call.title}`);
  }

  onTestEnd(options: IOptions, Call: Call) {
    console.log(`Finished test ${Call.title}: ${Call.valid ? "success" : "error"}`);
  }

  onEnd(options: IOptions, Calls: Call[]) {
    const failed = Calls.filter((ec) => !ec.valid);
    const passed = Calls.filter((ec) => ec.valid);
    console.log(`Finished the running ${Calls.length} tests: ${failed.length} failed, ${passed.length} passed`);
  }
}

export default EmptyReporter;
