import { OpenrpcDocument } from "@open-rpc/meta-schema";

export default (callResults: any[], schema: OpenrpcDocument) => {
  console.log(JSON.stringify(callResults, undefined, 4));
};
