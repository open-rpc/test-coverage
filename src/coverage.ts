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

export interface Call {
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

  let calls: Call[] = [];

  let rules: Rule[] = [new JsonSchemaFakerRule(), new ExamplesRule()];
  if (options.rules && options.rules.length > 0) {
    rules = options.rules;
  }

  for (const reporter of options.reporters) {
    reporter.onBegin(options, calls);
  }

  for (const rule of rules) {
    await Promise.resolve(rule.onBegin?.(options));
  }

  // getCalls could be async or sync
  const callsPromises = await Promise.all(filteredMethods.map((method) =>
    Promise.all(
      rules.map(async (rule) => {
        const _calls = await Promise.resolve(rule.getCalls(options.openrpcDocument, method))
        _calls.forEach((call) => {
          // this adds the rule after the fact, it's a bit of a hack
          call.rule = rule;
        });
        return _calls;
      }
      )
    )
  ));
  calls.push(...callsPromises.flat().flat());

  for (const call of calls) {
    for (const reporter of options.reporters) {
      reporter.onTestBegin(options, call);
    }
    // lifecycle methods could be async or sync
    await Promise.resolve(call.rule?.beforeRequest?.(options, call));

    // transport is async but the await needs to happen later
    // so that afterRequest is run immediately after the request is made
    const callResultPromise = options.transport(
      call.url,
      call.methodName,
      call.params
    );
    await Promise.resolve(call.rule?.afterRequest?.(options, call));
    try {
      const callResult = await callResultPromise;
      call.result = callResult.result;
      call.error = callResult.error;
    } catch (e) {
      call.valid = false;
      call.requestError = e;
    }
    if (call.requestError === undefined) {
      await Promise.resolve(call.rule?.validateCall(call));
    }
    await Promise.resolve(call.rule?.afterResponse?.(options, call));
    for (const reporter of options.reporters) {
      reporter.onTestEnd(options, call);
    }
  }

  for (const rule of rules) {
    await Promise.resolve(rule.onEnd?.(options, calls));
  }

  for (const reporter of options.reporters) {
    reporter.onEnd(options, calls);
  }
  return calls;
};
