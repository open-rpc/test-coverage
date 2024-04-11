import {
  OpenrpcDocument,
  JSONSchema,
  MethodObject,
} from "@open-rpc/meta-schema";
import Reporter from "./reporters/emptyReporter";
import JsonSchemaFakerRule from "./rules/json-schema-faker-rule";
import ExamplesRule from "./rules/examples-rule";
import Rule from "./rules/rule";

export interface IOptions {
  openrpcDocument: OpenrpcDocument;
  skip: string[];
  only: string[];
  rules?: Rule[];
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
  error?: {
    message: string;
    code: number;
    data: any;
  };
  title: string;
  rule?: Rule;
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

  let rules: Rule[] = [new JsonSchemaFakerRule(), new ExamplesRule()];
  if (options.rules) {
    rules = options.rules;
  }

  filteredMethods.forEach((method) => {
    rules.forEach((rule) =>
      rule.getExampleCalls(options.openrpcDocument, method)
        .forEach((exampleCall) => exampleCalls.push({...exampleCall, rule}))
    );
  });

  for (const reporter of options.reporters) {
    reporter.onBegin(options, exampleCalls);
  }

  for (const exampleCall of exampleCalls) {
    for (const reporter of options.reporters) {
      reporter.onTestBegin(options, exampleCall);
    }
    // lifecycle methods could be async or sync
    await Promise.resolve(exampleCall.rule?.beforeRequest?.(options, exampleCall));

    const callResultPromise = options.transport(
      exampleCall.url,
      exampleCall.methodName,
      exampleCall.params
    );
    await Promise.resolve(exampleCall.rule?.afterRequest?.(options, exampleCall));
    try {
      const callResult = await callResultPromise;
      exampleCall.result = callResult.result;
      exampleCall.error = callResult.error;
      await Promise.resolve(exampleCall.rule?.validateExampleCall?.(exampleCall));
    } catch (e) {
      exampleCall.valid = false;
      exampleCall.requestError = e;
    }
    await Promise.resolve(exampleCall.rule?.afterResponse?.(options, exampleCall));
    for (const reporter of options.reporters) {
      reporter.onTestEnd(options, exampleCall);
    }
  }

  for (const reporter of options.reporters) {
    reporter.onEnd(options, exampleCalls);
  }
  return exampleCalls;
};
