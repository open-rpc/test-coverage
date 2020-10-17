import colors from "colors";
import {
  OpenrpcDocument,
  JSONSchemaObject,
} from "@open-rpc/meta-schema";
import {ExampleCall} from "../coverage";
import _ from "lodash";

const getExpectedString = (ex: ExampleCall) => {
  let resSchemaID;
  if (ex.resultSchema === true) { resSchemaID = "true"; }
  else if (ex.resultSchema === false) { resSchemaID = "false"; }
  else {
    const s = (ex.resultSchema as JSONSchemaObject);
    resSchemaID = s.title ? s.title + s.type : s.type
  }
  const exRes = typeof ex.expectedResult === "string" ? ex.expectedResult : JSON.stringify(ex.expectedResult);
  return ex.expectedResult ? exRes : resSchemaID;
};

export default (callResults: ExampleCall[], schema: OpenrpcDocument) => {
  const metrics = {
    success: 0,
    error: 0
  };

  _.chain(callResults)
    .groupBy("methodName")
    .forEach((exampleCallsForMethod, methodName) => {
      const hasInvalid = exampleCallsForMethod.reduce((m, {valid}) => m || !valid, false);

      if (hasInvalid) {
        console.log(colors.bgRed(colors.yellow(methodName + ":")));
      } else {
        console.log(colors.bgGreen(colors.black(methodName + ":")));
      }

      exampleCallsForMethod.forEach((ex) => {
        if (ex.valid) {
          metrics.success++;
          const expected = getExpectedString(ex);
          console.log(
            "\t",
            colors.bold(colors.green("✓")),
            colors.magenta("-"),
            colors.blue(`${methodName}(${JSON.stringify(ex.params)})`),
          );
        } else {
          metrics.error++;
          const expected = getExpectedString(ex);
          console.log(
            "\t",
            colors.bold(colors.red("X")),
            colors.magenta("-"),
            colors.bgRed(colors.blue(`${methodName}(${JSON.stringify(ex.params)})`)),
            colors.magenta(" -> "),
            colors.red(expected),
          );

          if (ex.requestError) {
            console.log(
              "\t\t \->",
              colors.red.underline("instead got an error: "),
              colors.red(ex.requestError)
            );
          } else {
            console.log(
              "\t\t \->",
              colors.red.underline("instead received: "),
              colors.red(ex.result)
            );

            if (ex.reason) {
              console.log(
                "\t\t \->",
                colors.red.underline("Reason for being invalid: "),
                colors.red(ex.reason)
              );
            }
          }
        }
        console.log("\n");
      });
    })
    .value();

  console.log("==========");
  console.log("Success: ", colors.green(metrics.success.toString()));
  console.log("Errors: ", colors.red(metrics.error.toString()));
  console.log("==========");

  process.exit(metrics.error);
};
