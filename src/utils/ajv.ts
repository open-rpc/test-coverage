import AjvModule from "ajv";

// Ajv 7 exposes its constructor differently through Node and Bun ESM imports.
export default AjvModule.default ?? AjvModule;
