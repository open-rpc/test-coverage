import { Call, IOptions } from '../coverage';
import Reporter from './reporter';

class EmptyReporter implements Reporter {
  onBegin(options: IOptions, calls: Call[]) {
    console.log(`Starting the run with ${calls.length} tests`);
  }

  onTestBegin(options: IOptions, call: Call) {
    console.log(`started test ${call.title}`);
  }

  onTestEnd(options: IOptions, call: Call) {
    console.log(`Finished test ${call.title}: ${call.valid ? "success" : "error"}`);
  }

  onEnd(options: IOptions, calls: Call[]) {
    const failed = calls.filter((ec) => !ec.valid);
    const passed = calls.filter((ec) => ec.valid);
    console.log(`Finished the running ${calls.length} tests: ${failed.length} failed, ${passed.length} passed`);
  }
}

export default EmptyReporter;
