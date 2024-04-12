import { MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { ExampleCall, IOptions } from "../coverage";

interface Rule {
  onBegin?(options: IOptions): Promise<void> | void;
  getExampleCalls(openrpcDocument: OpenrpcDocument, method: MethodObject): ExampleCall[] | Promise<ExampleCall[]>;
  validateExampleCall(exampleCall: ExampleCall): Promise<ExampleCall> | ExampleCall;
  onEnd?(options: IOptions, exampleCalls: ExampleCall[]): void;
  // example call lifecycle
  beforeRequest?(options: IOptions, exampleCall: ExampleCall): Promise<void> | void;
  afterRequest?(options: IOptions, exampleCall: ExampleCall): Promise<void> | void;
  afterResponse?(options: IOptions, exampleCall: ExampleCall): Promise<void> | void;
}

export default Rule;
