import colors from "colors";
import {
  JSONSchemaObject,
} from "@open-rpc/meta-schema";
import {ExampleCall, IOptions} from "../coverage";
import _ from "lodash";
import Reporter from "./reporter";

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

class ConsoleReporter extends Reporter {

  onBegin(options: IOptions, exampleCalls: ExampleCall[]) {}
  onTestBegin(options: IOptions, exampleCall: ExampleCall) {}
  onTestEnd(options: IOptions, exampleCall: ExampleCall) {}
  onEnd(options: IOptions, exampleCalls: ExampleCall[]) {
    const metrics = {
      success: 0,
      error: 0
    };
    _.chain(exampleCalls)
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
              colors.bgRed(colors.blue(`${methodName}(${JSON.stringify(ex.params)})`))
            );
            console.log(
              colors.magenta("\t\t\t \->"),
              colors.white.underline("Expected result:"),
              colors.white(expected),
            );

            if (ex.requestError) {
              console.log(
                colors.magenta("\t\t\t \->"),
                colors.white.underline("instead got an error: "),
                colors.red(ex.requestError)
              );
            } else {
              console.log(
                colors.magenta("\t\t\t \->"),
                colors.white.underline("instead received: "),
                colors.red(JSON.stringify(ex.result))
              );

              if (ex.reason) {
                console.log(
                  colors.magenta("\t\t\t\t \->"),
                  colors.yellow.underline("Reason for being invalid: "),
                  colors.yellow(ex.reason)
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

    process.exit(metrics.error > 0 ? 1 : 0);
  }
}

export default ConsoleReporter;
