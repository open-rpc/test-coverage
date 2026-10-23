import { ITransport } from "./ITransport";
let id = 1;

const httpTransport: ITransport = async (url: string, method: string, params: any[]) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: id++,
      method,
      params,
    }),
  });
  return response.json();
};

export default httpTransport;
