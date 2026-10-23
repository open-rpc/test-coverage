import { Call, IOptions } from '../coverage.js';
import Reporter from './reporter.js';

class JsonReporter implements Reporter {
  onBegin(options: IOptions, calls: Call[]) {}
  onTestBegin(options: IOptions, call: Call) {}

  onTestEnd(options: IOptions, call: Call) {}

  onEnd(options: IOptions, calls: Call[]) {
    const massaged: any = calls.map((c) => {
      return {
        ...c,
        rule: c.rule?.getTitle(),
      };
    });
    console.log(JSON.stringify(massaged, undefined, 4));
  }
}

export default JsonReporter;
