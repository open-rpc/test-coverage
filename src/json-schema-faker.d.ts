declare module "json-schema-faker" {
  import type { JSONSchema } from "@open-rpc/schema-utils-js/build/types.js";

  const jsf: {
    generate(schema: JSONSchema): unknown;
  };
  export default jsf;
}
