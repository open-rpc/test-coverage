import {
  OpenrpcDocument,
  ExamplePairingObject,
  ExampleObject,
  JSONSchema,
  ContentDescriptorObject,
  Servers
} from "@open-rpc/meta-schema";
const jsf = require("json-schema-faker"); // tslint:disable-line
import Ajv from "ajv";
import { isEqual } from "lodash";

const getFakeParams = (params: any[]): any[] => {
  return params.map((p) => jsf.generate(p.schema));
};

interface IOptions {
  openrpcDocument: OpenrpcDocument;
  skipMethods: string[];
  transport(url: string, method: string, params: any[]): PromiseLike<any>;
  reporter(value: any[], schema: OpenrpcDocument): any;
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
}

export default async (options: IOptions) => {
  const filteredMethods = options.openrpcDocument.methods
    .filter(({name}) => !options.skipMethods.includes(name));

  const exampleCalls: ExampleCall[] = [];

  const servers: Servers = (options.openrpcDocument.servers || [{url: "http://localhost:3333"}]);

  servers.forEach(({url}) => {
    filteredMethods.forEach((method) => {
      if (method.examples === undefined || method.examples.length === 0) {
        for (let i = 0; i < 10; i++) {
          exampleCalls.push({
            methodName: method.name,
            params: getFakeParams(method.params),
            url,
            resultSchema: (method.result as ContentDescriptorObject).schema
          });
        }
        return;
      }

      (method.examples as ExamplePairingObject[]).forEach((ex) => {
        exampleCalls.push({
          methodName: method.name,
          params: (ex.params as ExampleObject[]).map((e) => e.value),
          url,
          resultSchema: (method.result as ContentDescriptorObject).schema,
          expectedResult: (ex.result as ExampleObject).value,
        });
      });
    });
  });

  for (const exampleCall of exampleCalls) {
    try {
      const callResult = await options.transport(exampleCall.url, exampleCall.methodName, exampleCall.params);
      exampleCall.result = callResult.result;

      if (exampleCall.expectedResult) {
        exampleCall.valid = isEqual(exampleCall.expectedResult, exampleCall.result);
      } else {
        const ajv = new Ajv();
        ajv.validate(exampleCall.resultSchema, exampleCall.result);
        if (ajv.errors && ajv.errors.length > 0) {
          exampleCall.valid = false;
          exampleCall.reason = JSON.stringify(ajv.errors);
        }
      }
    } catch (e) {
      exampleCall.valid = false;
      exampleCall.requestError = e;
    }
  }

  options.reporter(exampleCalls, options.openrpcDocument);
};
