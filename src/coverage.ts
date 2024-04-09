import {
  OpenrpcDocument,
  ExamplePairingObject,
  ExampleObject,
  JSONSchema,
  ContentDescriptorObject,
  Servers,
  MethodObjectParams,
  MethodObject
} from "@open-rpc/meta-schema";
const jsf = require("json-schema-faker"); // tslint:disable-line
import Ajv from "ajv";
import { isEqual } from "lodash";

const getFakeParams = (params: any[]): any[] => {
  return params.map((p) => jsf.generate(p.schema));
};

interface IOptions {
  openrpcDocument: OpenrpcDocument;
  skip: string[];
  only: string[];
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

const paramsToObj = (params: any[], methodParams: ContentDescriptorObject[]): any => {
  return params.reduce((acc, val, i) => {
    acc[methodParams[i].name] = val;
    return acc;
  }, {});
}

export default async (options: IOptions) => {
  const filteredMethods = (options.openrpcDocument.methods as MethodObject[])
    .filter(({ name }) => !options.skip.includes(name))
    .filter(({ name }) => options.only.length === 0 || options.only.includes(name));

  if (filteredMethods.length === 0) {
    throw new Error("No methods to test");
  }

  const exampleCalls: ExampleCall[] = [];

  const servers: Servers = (options.openrpcDocument.servers || [{ url: "http://localhost:3333" }]);

  servers.forEach(({ url }) => {
    filteredMethods.forEach((method) => {
      if (method.examples === undefined || method.examples.length === 0) {
        for (let i = 0; i < 10; i++) {
          const p = getFakeParams(method.params);
          // handle object or array case
          const params = method.paramStructure === "by-name" ? paramsToObj(p, method.params as ContentDescriptorObject[]) : p;
          exampleCalls.push({
            methodName: method.name,
            params,
            url,
            resultSchema: (method.result as ContentDescriptorObject).schema
          });
        }
        return;
      }

      (method.examples as ExamplePairingObject[]).forEach((ex) => {
        const p = (ex.params as ExampleObject[]).map((e) => e.value);
        const params = method.paramStructure === "by-name" ? paramsToObj(p, method.params as ContentDescriptorObject[]) : p;
        exampleCalls.push({
          methodName: method.name,
          params,
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
        } else {
          exampleCall.valid = true;
        }
      }
    } catch (e) {
      exampleCall.valid = false;
      exampleCall.requestError = e;
    }
  }

  return options.reporter(exampleCalls, options.openrpcDocument);
};
