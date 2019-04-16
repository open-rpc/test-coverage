import { OpenRPC } from "@open-rpc/meta-schema";
const refParser = require('json-schema-ref-parser');
const jsf = require('json-schema-faker');

const getParams = async (params: any[]) => {
  const promises = params.map((p) => {
    return jsf.generate(p.schema);
  })
  return Promise.all(promises);
}

let schema: OpenRPC;

const results: any[] = [];

interface IOptions {
  schema: OpenRPC;
  skipMethods: string[];
  transport(method: string, params: any[]): PromiseLike<any>;
  reporter(value: any[]): any;
}

export default async (options: IOptions) => {
  const promises = options.schema.methods.map(async (method) => {
    if (options.skipMethods.includes(method.name)) {
      return Promise.resolve();
    }
    const params = await getParams(method.params);
    return options.transport(method.name, params)
      .then((r: any) => {
        if (r.error && r.error.message.includes('does not exist')) {
          results.push({
            method: method.name,
            error: 'Method Does Not Exist'
          });
        } else if (r.error) {
          results.push({
            method: method.name,
            error: r.error.message
          });
        } else {
          results.push({
            method: method.name,
            result: r.result
          });
        }
      });
  });

  return Promise.all(promises).then(() => {
    return results;
  }).then(options.reporter)
}