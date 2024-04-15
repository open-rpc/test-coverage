import { Call, IOptions } from "../coverage";

interface Reporter {
  onBegin(options: IOptions, calls: Call[]): void;
  onTestBegin(options: IOptions, call: Call): void;
  onTestEnd(options: IOptions, call: Call): void;
  onEnd(options: IOptions, calls: Call[]): void;
}

export default Reporter;
