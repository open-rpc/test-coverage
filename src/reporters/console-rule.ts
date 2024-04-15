import colors from "colors";
import { JSONSchemaObject } from "@open-rpc/meta-schema";
import { Call, IOptions } from "../coverage";
import _ from "lodash";
import Reporter from "./reporter";

const getExpectedString = (ex: Call) => {
  let resSchemaID;
  if (ex.resultSchema === true) {
    resSchemaID = "true";
  } else if (ex.resultSchema === false) {
    resSchemaID = "false";
  } else {
    const s = ex.resultSchema as JSONSchemaObject;
    resSchemaID = s.title ? s.title + s.type : s.type;
  }
  const exRes =
    typeof ex.expectedResult === "string"
      ? ex.expectedResult
      : JSON.stringify(ex.expectedResult);
  return ex.expectedResult ? exRes : resSchemaID;
};

class ConsoleRuleReporter implements Reporter {
  private metrics: {
    success: number;
    error: number;
  };

  constructor() {
    this.metrics = {
      success: 0,
      error: 0,
    };
  }

  onBegin(options: IOptions, calls: Call[]) {}
  onTestBegin(options: IOptions, call: Call) {}
  onTestEnd(options: IOptions, call: Call) {}
  onEnd(options: IOptions, calls: Call[]) {
    const metrics = {
      success: 0,
      error: 0,
    };
    _.chain(calls)
      .groupBy((call) => call.rule?.getTitle())
      .forEach((callsForRule, ruleName) => {
        const hasInvalid = callsForRule.reduce(
          (m, { valid }) => m || !valid,
          false
        );

        console.log("\n");
        if (hasInvalid) {
          console.log(colors.bgRed(colors.yellow(ruleName + ":")));
        } else {
          console.log(colors.bgGreen(colors.black(ruleName + ":")));
        }
        callsForRule.forEach((ex) => {
          if (ex.valid) {
            this.metrics.success++;
            const expected = getExpectedString(ex);
            const timeDiff = (ex.timings!.endTime! - ex.timings!.startTime!);
            const threshold = 1000;
            const timeDiffColor = timeDiff <= threshold ? 'green' : 'yellow'; // Fast tests are green, slow tests are red
            console.log(
              " ",
              colors.bold(colors.green("✓")),
              colors.magenta("-"),
              colors.blue(`${ex.methodName}(${JSON.stringify(ex.params)})`),
              colors.italic.bold.dim(ex.title),
              colors[timeDiffColor].dim(((ex.timings!.endTime! - ex.timings!.startTime!) / 1000).toString() + "s"),
            );
          } else {
            this.metrics.error++;
            const expected = getExpectedString(ex);
            console.log(
              " ",
              colors.bold(colors.red("X")),
              colors.magenta("-"),
              colors.bgRed(colors.blue(`${ex.methodName}(${JSON.stringify(ex.params)})`)),
              colors.gray(ex.title),
              colors.gray(((ex.timings!.endTime! - ex.timings!.startTime!) / 1000).toString() + "s")
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
                colors.red(JSON.stringify(ex.result !== undefined ? ex.result : ex.error))
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
        });
      })
      .value();

    // get method call coverage
    const passingCallsByMethod = calls.reduce((m, call) => {
      if (call.valid === false) {
        return m;
      }
      if (!m[call.methodName]) {
        m[call.methodName] = [];
      }
      m[call.methodName].push(call);
      return m;
    }, {} as { [key: string]: Call[] });

    const passingMethods = Object.keys(passingCallsByMethod);

    const failedCallsByMethod = calls.reduce((m, call) => {
      this.metrics[call.valid ? "success" : "error"]++;
      if (call.valid === true) {
        return m;
      }
      if (!m[call.methodName]) {
        m[call.methodName] = [];
      }
      m[call.methodName].push(call);
      return m;
    }, {} as { [key: string]: Call[] });

    const totalPassingMethods = Object.keys(passingCallsByMethod).length;
    const openrpcMethods = options.openrpcDocument.methods.length;

    const failedMethods = Object.keys(failedCallsByMethod);

    //take into account failed methods
    const missingMethods: string[] = options.openrpcDocument.methods
      .map(({ name }) => name)
      .filter((methodName) => !passingMethods.includes(methodName))
      .filter((methodName) => !failedMethods.includes(methodName));

    console.log("==========");
    if (options.skip && options.skip.length > 0) {
      console.log("Skipped:");
    }
    console.log("Methods");
    console.log(
      `  Coverage: ${totalPassingMethods}/${openrpcMethods} (${(
        (totalPassingMethods / openrpcMethods) *
        100
      ).toFixed(2)}%)`
    );
    console.log(
      "  Passing: ",
      colors.green(
        passingMethods
          .map(
            (m) =>
              colors.green(m) +
              colors.magenta(" - ") +
              colors.blue(`${passingCallsByMethod[m].length}`)
          )
          .join(", ")
      )
    );
    if (failedMethods.length > 0) {
      console.log(
        "  Failed:",
        colors.red(
          failedMethods
            .map(
              (m) =>
                colors.red(m) +
                colors.magenta(" - ") +
                colors.blue(`${failedCallsByMethod[m].length}`)
            )
            .join(", ")
        )
      );
    }
    console.log("  Missing: ", colors.gray(missingMethods.join(", ")));
    console.log(
      "Total Time: ",
      colors.green(
        (
          calls.reduce(
            (m, { timings }) => m + (timings!.endTime! - timings!.startTime!),
            0
          ) / 1000
        ).toString() + "s"
      )
    );
    console.log(
      "Call Success: ",
      colors.green(this.metrics.success.toString())
    );
    console.log("Call Failed: ", colors.red(this.metrics.error.toString()));
    console.log("==========");

    process.exit(metrics.error > 0 ? 1 : 0);
  }
}

export default ConsoleRuleReporter;
