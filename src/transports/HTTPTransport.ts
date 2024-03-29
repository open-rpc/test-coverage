import fetch from "isomorphic-fetch";
import { ITransport } from "./ITransport";
let id = 1;

const httpTransport: ITransport = async (url: string, method: string, params: any[]) => {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: id++,
      method,
      params,
    }),
  }).then((r: any) => {
    return r.json();
  });
};

export default httpTransport;
