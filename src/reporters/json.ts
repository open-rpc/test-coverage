import { JSONSchemaObject } from '@open-rpc/meta-schema';
import { Call, IOptions } from '../coverage';
import Reporter from './reporter';

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
