import { OpenRPC } from "@open-rpc/meta-schema";
const refParser = require('json-schema-ref-parser');
const jsf = require('json-schema-faker');

const getParams = async (params: any[]) => {
  const promises = params.map((p) => {
    return jsf.generate(p.schema);
  })
  return Promise.all(promises);
}


interface IOptions {
  schema: OpenRPC;
  skipMethods: string[];
  transport(url: string, method: string, params: any[]): PromiseLike<any>;
  reporter(value: any[], schema: OpenRPC): any;
}

export default async (options: IOptions) => {
  const results: any[] = [];
  const promises = options.schema.methods.map(async (method) => {
    if (options.skipMethods.includes(method.name)) {
      return;
    }
    const params = await getParams(method.params);
    const urls = (options.schema.servers || []).map((u) => {
      // TODO: support server variables
      return u.url;
    })
    return Promise.all(urls.map((url) => {
      return options.transport(url, method.name, params)
        .then((r: any) => {
          results.push({
            method: method.name,
            params,
            ...r
          })
        });
    }))
  });

  return Promise.all(promises).then(() => {
    return results;
  }).then((callResults) => {
    options.reporter(callResults, options.schema);
  });
}
