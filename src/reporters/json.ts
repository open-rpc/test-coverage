import { Call, IOptions } from '../coverage';
import Reporter from './reporter';

class JsonReporter implements Reporter {
  onBegin(options: IOptions, calls: Call[]) {}
  onTestBegin(options: IOptions, call: Call) {}

  onTestEnd(options: IOptions, call: Call) {}

  onEnd(options: IOptions, calls: Call[]) {
    const failed = calls.filter((ec) => !ec.valid);

    const passed = calls.filter((ec) => ec.valid);

    console.log(JSON.stringify(calls, undefined, 4));
  }
}

export default JsonReporter;
