import coverage from "./coverage.js";
import HTTPTransport from "./transports/HTTPTransport.js";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { ITransport } from "./transports/ITransport.js";
import ConsoleReporter from "./reporters/console.js";
import JsonReporter from "./reporters/json.js";
import EmptyReporter from "./reporters/emptyReporter.js";
import Rule from "./rules/rule.js";
import ConsoleRuleReporter from "./reporters/console-rule.js";
import ConsoleStreamingReporter from "./reporters/console-streaming.js";
import HtmlReporter from "./reporters/html-reporter.js";
import Reporter from "./reporters/reporter.js";
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
  reporters?: ReporterStringOrReport[];
  rules?: Rule[];
  transport: "http" | ITransport;
}

export default async (options: IOptions) => {
  const transport = typeof options.transport === "function" ? options.transport : transports[options.transport || "http"];
  let reporterInstances = (options.reporters ?? []).map((reporter) => {
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
