import consoleReporter from "./reporters/console";
import coverage from "./coverage";
import HTTPTransport from "./transports/HTTPTransport";
import jsonReporter from "./reporters/json";
import { OpenrpcDocument } from "@open-rpc/meta-schema";

const reporters = {
  console: consoleReporter,
  json: jsonReporter,
};

const transports = {
  http: HTTPTransport,
};

interface IOptions {
  openrpcDocument: OpenrpcDocument;
  skipMethods?: string[];
  reporter: "console" | "json";
  transport: "http";
}

export default async (options: IOptions) => {
  return coverage({
    reporter: reporters[options.reporter || "console"],
    openrpcDocument: options.openrpcDocument,
    skipMethods: options.skipMethods || [],
    transport: transports[options.transport || "http"],
  });
};
