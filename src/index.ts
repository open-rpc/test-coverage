import coverage from "./coverage";
import HTTPTransport from "./transports/HTTPTransport";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { ITransport } from "./transports/ITransport";
import ConsoleReporter from "./reporters/console";
import JsonReporter from "./reporters/json";
import EmptyReporter from "./reporters/emptyReporter";
import Rule from "./rules/rule";
import ConsoleRuleReporter from "./reporters/console-rule";
import ConsoleStreamingReporter from "./reporters/console-streaming";
import HtmlReporter from "./reporters/html-reporter";
import Reporter from "./reporters/reporter";
const reporters = {
  console: ConsoleReporter,
  json: JsonReporter,
  empty: EmptyReporter,
  "console-streaming": ConsoleStreamingReporter,
  "console-rule": ConsoleRuleReporter,
  "html": HtmlReporter
};

const transports = {
  http: HTTPTransport,
};
type ReporterString = "console" | "json" | "empty" | "console-streaming" | "console-rule" | "html";

type ReporterStringOrReport = ReporterString | Reporter;
interface IOptions {
  openrpcDocument: OpenrpcDocument;
  skip?: string[];
  only?: string[];
  reporters: ReporterStringOrReport[];
  rules?: Rule[];
  transport: "http" | ITransport;
}

export default async (options: IOptions) => {
  const transport = typeof options.transport === "function" ? options.transport : transports[options.transport || "http"];
  let reporterInstances = options.reporters.map((reporter) => {
    if (typeof reporter === "string") {
      return new reporters[reporter as ReporterString];
    }
    return reporter;
  });
  if (reporterInstances.length === 0) {
    reporterInstances = [new reporters["console"]()];
  }
  return coverage({
    reporters: reporterInstances,
    rules: options.rules || [],
    openrpcDocument: options.openrpcDocument,
    skip: options.skip || [],
    only: options.only || [],
    transport,
  });
};
