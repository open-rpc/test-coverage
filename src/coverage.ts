import { OpenrpcDocument, ExamplePairingObject, ExampleObject } from "@open-rpc/meta-schema";
const jsf = require("json-schema-faker"); // tslint:disable-line

const getFakeParams = async (params: any[]) => {
  const promises = params.map((p) => {
    return jsf.generate(p.schema);
  });
  return Promise.all(promises);
};

interface IOptions {
  schema: OpenrpcDocument;
  skipMethods: string[];
  transport(url: string, method: string, params: any[]): PromiseLike<any>;
  reporter(value: any[], schema: OpenrpcDocument): any;
}

export default async (options: IOptions) => {
  const results: any[] = [];
  const promises = options.schema.methods.map(async (method) => {
    if (options.skipMethods.includes(method.name)) {
      return;
    }
    let exampleParamSet: any[] = [];
    if (method.examples && method.examples.length > 0) {
      exampleParamSet = (method.examples as ExamplePairingObject[]).map((ex: ExamplePairingObject) => {
        return (ex.params as ExampleObject[]).map((p: ExampleObject) => {
          return (p as ExampleObject).value;
        });
      });
    } else {
      exampleParamSet = [await getFakeParams(method.params)];
    }
    const urls = (options.schema.servers || []).map((u) => {
      // TODO: support server variables
      return u.url;
    });
    return Promise.all(urls.map((url) => {
      return Promise.all(exampleParamSet.map(async (params: any, exampleIndex: number) => {
        const r = await options.transport(url, method.name, params);
        results.push({
          method: method.name,
          exampleIndex,
          params,
          ...r,
        });
      }));
    }));
  });

  await Promise.all(promises);
  options.reporter(results, options.schema);
};
