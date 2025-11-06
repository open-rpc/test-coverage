import { Call, IOptions } from "../coverage";

interface Reporter {
  onBegin(options: IOptions, calls: Call[]): void | Promise<void>;
  onTestBegin(options: IOptions, call: Call): void | Promise<void>;
  onTestEnd(options: IOptions, call: Call): void | Promise<void>;
  onEnd(options: IOptions, calls: Call[]): void | Promise<void>;
}

export default Reporter;
