import colors from "colors";
import Ajv, { ErrorObject } from "ajv";
import {
  OpenrpcDocument,
  MethodObject,
  ContentDescriptorObject,
  ExamplePairingObject,
  ExampleObject,
} from "@open-rpc/meta-schema";

export default (callResults: any[], schema: OpenrpcDocument) => {
  const ajv = new Ajv();
  const metrics = {
    errors: 0,
    success: 0,
  };

  callResults.forEach(async (call) => {
    if (call.error) {
      metrics.errors++;
      console.log(colors.red.underline("JSON-RPC Request Error: "), colors.cyan(call.method));
      console.log(call.error);
      console.log(call.params);
    } else {

      const methodSchema = schema.methods.find((m: MethodObject) => m.name === call.method);
      if (!methodSchema) {
        return console.log(`Error: no result defined for ${call.method}`);
      }
      const result = methodSchema.result as ContentDescriptorObject;

      let resultSchema: any = result.schema;

      if (result.oneOf) {
        resultSchema = {
          oneOf: result.oneOf.map((cd: ContentDescriptorObject) => cd.schema),
        };
      }

      if (methodSchema.examples && methodSchema.examples.length > 0) {
        const example = (methodSchema.examples[call.exampleIndex] as ExamplePairingObject);
        const checkParams = (example.params as ExampleObject[]).map((p: ExampleObject) => p.value);
        const paramsEqual = (JSON.stringify(checkParams) === JSON.stringify(call.params));
        const resultEqual = JSON.stringify(call.result) === JSON.stringify((example.result as ExampleObject).value)
        if (paramsEqual && resultEqual) {
          metrics.success++;
          console.log(colors.green("Example Success: "), call.method, call.params, call.result);
        } else {
          console.log(colors.red.underline("Example Validation Error: "), colors.cyan(call.method));
          console.log('params: ', call.params);
          console.log('result: ', call.result);
          console.log('examples: ', methodSchema.examples);
          console.log('method object', methodSchema);
        }
        return;
      }

      ajv.validate(resultSchema, call.result);
      const errors = ajv.errors as ErrorObject[];

      if (!errors || errors.length === 0) {
        metrics.success++;
        console.log(colors.green("Success: "), call.method);
      } else {
        console.log(colors.red.underline("Result Validation Error: "), colors.cyan(call.method));
        console.log('call: ', call);
        console.log('errors: ', errors);
        console.log('method: ', methodSchema);
      }
    }
  });
  console.log("==========");
  console.log("Success: ", colors.green(metrics.success.toString()));
  console.log("Errors: ", colors.red(metrics.errors.toString()));
  console.log("==========");
  process.exit(metrics.errors);
};
