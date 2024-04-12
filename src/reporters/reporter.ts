import { Call, IOptions } from "../coverage";

interface Reporter {
  onBegin(options: IOptions, Calls: Call[]): void;
  onTestBegin(options: IOptions, Call: Call): void;
  onTestEnd(options: IOptions, Call: Call): void;
  onEnd(options: IOptions, Calls: Call[]): void;
}

export default Reporter;
