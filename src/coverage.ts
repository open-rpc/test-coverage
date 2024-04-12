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
  if (options.rules && options.rules.length > 0) {
    rules = options.rules;
  }

  for (const reporter of options.reporters) {
    reporter.onBegin(options, exampleCalls);
  }

  for (const rule of rules) {
    await Promise.resolve(rule.onBegin?.(options));
  }

  // getExampleCalls could be async or sync
  const exampleCallsPromises = await Promise.all(filteredMethods.map((method) =>
    Promise.all(
      rules.map(async (rule) => {
        const calls = await Promise.resolve(rule.getExampleCalls(options.openrpcDocument, method))
        calls.forEach((call) => {
          // this adds the rule after the fact, it's a bit of a hack
          call.rule = rule;
        });
        return calls;
      }
      )
    )
  ));
  exampleCalls.push(...exampleCallsPromises.flat().flat());

  for (const exampleCall of exampleCalls) {
    for (const reporter of options.reporters) {
      reporter.onTestBegin(options, exampleCall);
    }
    // lifecycle methods could be async or sync
    await Promise.resolve(exampleCall.rule?.beforeRequest?.(options, exampleCall));

    // transport is async but the await needs to happen later
    // so that afterRequest is run immediately after the request is made
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
    } catch (e) {
      exampleCall.valid = false;
      exampleCall.requestError = e;
    }
    if (exampleCall.requestError === undefined) {
      await Promise.resolve(exampleCall.rule?.validateExampleCall(exampleCall));
    }
    await Promise.resolve(exampleCall.rule?.afterResponse?.(options, exampleCall));
    for (const reporter of options.reporters) {
      reporter.onTestEnd(options, exampleCall);
    }
  }

  for (const rule of rules) {
    await Promise.resolve(rule.onEnd?.(options, exampleCalls));
  }

  for (const reporter of options.reporters) {
    reporter.onEnd(options, exampleCalls);
  }
  return exampleCalls;
};
