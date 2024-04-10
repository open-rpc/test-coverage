import {
  OpenrpcDocument,
  JSONSchema,
  MethodObject,
} from "@open-rpc/meta-schema";
import Reporter from "./reporters/emptyReporter";
import JsonSchemaFakerRule from "./rules/json-schema-faker-rule";
import ExamplesRule from "./rules/examples-rule";

export interface IOptions {
  openrpcDocument: OpenrpcDocument;
  skip: string[];
  only: string[];
  transport(url: string, method: string, params: any[]): PromiseLike<any>;
  reporters: Reporter[];
}

export interface ExampleCall {
  methodName: string;
  params: any[];
  url: string;
  result?: any;
  valid?: boolean;
  reason?: string;
  resultSchema: JSONSchema;
  expectedResult?: any;
  requestError?: any;
  title: string;
}

export default async (options: IOptions) => {
  const filteredMethods = (options.openrpcDocument.methods as MethodObject[])
    .filter(({ name }) => !options.skip.includes(name))
    .filter(
      ({ name }) => options.only.length === 0 || options.only.includes(name)
    );

  if (filteredMethods.length === 0) {
    throw new Error("No methods to test");
  }

  let exampleCalls: ExampleCall[] = [];

  const rules = [new JsonSchemaFakerRule(), new ExamplesRule()];

  filteredMethods.forEach((method) => {
    rules.forEach((rule) =>
      rule.getExampleCalls(options.openrpcDocument, method)
        .forEach((exampleCall) => exampleCalls.push(exampleCall))
    );
  });

  for (const reporter of options.reporters) {
    reporter.onBegin(options, exampleCalls);
  }

  for (const exampleCall of exampleCalls) {
    for (const reporter of options.reporters) {
      reporter.onTestBegin(options, exampleCall);
    }
    try {
      const callResult = await options.transport(
        exampleCall.url,
        exampleCall.methodName,
        exampleCall.params
      );
      exampleCall.result = callResult.result;
      rules.forEach((rule) => rule.validateExampleCall(exampleCall));
    } catch (e) {
      exampleCall.valid = false;
      exampleCall.requestError = e;
    }
    for (const reporter of options.reporters) {
      reporter.onTestEnd(options, exampleCall);
    }
  }

  for (const reporter of options.reporters) {
    reporter.onEnd(options, exampleCalls);
  }
  return exampleCalls;
};
