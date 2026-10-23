import type {
  ExamplePairingObject,
  JSONSchema,
  ReferenceObject,
} from "@open-rpc/schema-utils-js/build/types.js";

export type {
  OpenrpcDocument,
  MethodObject,
  ContentDescriptorObject,
  JSONSchema,
  ExamplePairingObject,
} from "@open-rpc/schema-utils-js/build/types.js";

// These two shapes are not exported directly by schema-utils.
export type JSONSchemaObject = Exclude<JSONSchema, boolean>;
export type ExampleObject = Exclude<NonNullable<ExamplePairingObject["result"]>, ReferenceObject>;
