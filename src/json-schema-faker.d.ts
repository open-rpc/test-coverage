declare module "json-schema-faker" {
  import type { JSONSchema } from "@open-rpc/meta-schema";

  const jsf: {
    generate(schema: JSONSchema): unknown;
  };
  export default jsf;
}
