import { OpenRPC } from "@open-rpc/meta-schema";

export default (callResults: any[], schema: OpenRPC) => {
  console.log(JSON.stringify(callResults, undefined, 4));
};
