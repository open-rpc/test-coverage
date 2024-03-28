import consoleReporter from "./reporters/console";
import coverage from "./coverage";
import HTTPTransport from "./transports/HTTPTransport";
import jsonReporter from "./reporters/json";
import rawReporter from "./reporters/raw";
import { OpenrpcDocument } from "@open-rpc/meta-schema";
import { ITransport } from "./transports/ITransport";

const reporters = {
  console: consoleReporter,
  json: jsonReporter,
  raw: rawReporter,
};

const transports = {
  http: HTTPTransport,
};

interface IOptions {
  openrpcDocument: OpenrpcDocument;
  skip?: string[];
  only?: string[];
  reporter: "console" | "json" | "raw";
  transport: "http" | ITransport;
}

export default async (options: IOptions) => {
  const transport = typeof options.transport === "function" ? options.transport : transports[options.transport || "http"];
  return coverage({
    reporter: reporters[options.reporter || "console"],
    openrpcDocument: options.openrpcDocument,
    skip: options.skip || [],
    only: options.only || [],
    transport: transport,
  });
};
