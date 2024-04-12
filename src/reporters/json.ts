import { Call, IOptions } from '../coverage';
import Reporter from './reporter';

class JsonReporter implements Reporter {
  onBegin(options: IOptions, Calls: Call[]) {}
  onTestBegin(options: IOptions, Call: Call) {}

  onTestEnd(options: IOptions, Call: Call) {}

  onEnd(options: IOptions, Calls: Call[]) {
    const failed = Calls.filter((ec) => !ec.valid);

    const passed = Calls.filter((ec) => ec.valid);

    console.log(JSON.stringify(Calls, undefined, 4));
  }
}

export default JsonReporter;
