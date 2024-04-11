import { MethodObject, OpenrpcDocument } from "@open-rpc/meta-schema";
import { ExampleCall, IOptions } from "../coverage";

interface Rule {
  onBegin(options: IOptions, exampleCalls: ExampleCall[]): void;
  getExampleCalls(openrpcDocument: OpenrpcDocument, method: MethodObject): ExampleCall[];
  validateExampleCall(exampleCall: ExampleCall): Promise<ExampleCall> | ExampleCall;
  onEnd(options: IOptions, exampleCalls: ExampleCall[]): void;
  // example call lifecycle
  beforeRequest(options: IOptions, exampleCall: ExampleCall): Promise<any> | void;
  afterRequest(options: IOptions, exampleCall: ExampleCall): Promise<any> | void;
  afterResponse(options: IOptions, exampleCall: ExampleCall): Promise<any> | void;
}

export default Rule;
