export type ITransport = (url: string, method: string, params: any) => Promise<any>;
