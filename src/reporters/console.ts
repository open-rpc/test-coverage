import colors from 'colors';
import Ajv, { ErrorObject, Ajv as IAjv } from "ajv";
import { OpenRPC, MethodObject, ContentDescriptorObject } from '@open-rpc/meta-schema';

export default (callResults: any[], schema: OpenRPC) => {
  const ajv = new Ajv();
  const metrics = {
    errors: 0,
    success: 0
  }
  callResults.forEach((call) => {
    if (call.error) {
      metrics.errors++;
      console.log(colors.red.underline('JSON-RPC Request Error: '), colors.cyan(call.method));
      console.log(call.error);
      console.log(call.params);
    } else {

      const methodSchema = schema.methods.find((m) => m.name === call.method);
      if (!methodSchema) {
        return console.log(`Error: no result defined for ${call.method}`);
      }

      const isValid = ajv.validate((methodSchema.result as ContentDescriptorObject).schema, `${call.method}/results`);
      const errors = ajv.errors as ErrorObject[];

      if (isValid) {
        metrics.success++;
        console.log(colors.green('Success: '), call.method)
      } else {
        console.log(colors.red.underline('Result Validation Error: '), colors.cyan(call.method));
        console.log(call);
        console.log(errors);
        console.log(methodSchema);
      }

    }
  })
  console.log('==========');
  console.log('Success: ', colors.green(metrics.success.toString()));
  console.log('Errors: ', colors.red(metrics.errors.toString()));
  console.log('==========');
};
