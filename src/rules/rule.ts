import { MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { Call, IOptions } from "../coverage";

interface Rule {
  onBegin?(options: IOptions): Promise<void> | void;
  getCalls(openrpcDocument: OpenrpcDocument, method: MethodObject): Call[] | Promise<Call[]>;
  validateCall(call: Call): Promise<Call> | Call;
  onEnd?(options: IOptions, calls: Call[]): void;
  // example call lifecycle
  beforeRequest?(options: IOptions, call: Call): Promise<void> | void;
  afterRequest?(options: IOptions, call: Call): Promise<void> | void;
  afterResponse?(options: IOptions, call: Call): Promise<void> | void;
}

export default Rule;
