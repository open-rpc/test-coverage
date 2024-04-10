import coverage from "./coverage";
import HTTPTransport from "./transports/HTTPTransport";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { ITransport } from "./transports/ITransport";
import ConsoleReporter from "./reporters/console";
import JsonReporter from "./reporters/json";
import RawReporter from "./reporters/raw";
import EmptyReporter from "./reporters/emptyReporter";

const reporters = {
  console: ConsoleReporter,
  json: JsonReporter,
  raw: RawReporter,
  empty: EmptyReporter,
};

const transports = {
  http: HTTPTransport,
};
type ReporterString = "console" | "json" | "raw" | "empty";
interface IOptions {
  openrpcDocument: OpenrpcDocument;
  skip?: string[];
  only?: string[];
  reporters: ReporterString[];
  transport: "http" | ITransport;
}

export default async (options: IOptions) => {
  const transport = typeof options.transport === "function" ? options.transport : transports[options.transport || "http"];
  let reporterInstances = options.reporters.map((reporter) => new reporters[reporter]);
  if (reporterInstances.length === 0) {
    reporterInstances = [new reporters["console"]()];
  }
  return coverage({
    reporters: reporterInstances,
    openrpcDocument: options.openrpcDocument,
    skip: options.skip || [],
    only: options.only || [],
    transport,
  });
};
