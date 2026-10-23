declare module "json-schema-faker" {
  import type * as V1_3 from "@open-rpc/spec-types/1_3";
  import type * as V1_4 from "@open-rpc/spec-types/1_4";

  const jsf: {
    generate(schema: V1_3.JSONSchema | V1_4.JSONSchema): unknown;
  };
  export default jsf;
}
