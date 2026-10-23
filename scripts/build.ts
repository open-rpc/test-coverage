import { rm } from "node:fs/promises";

const entrypoints = Array.from(new Bun.Glob("src/**/*.ts").scanSync())
  .filter((file) => !file.endsWith(".test.ts"));

await rm("build", { recursive: true, force: true });

const result = await Bun.build({
  entrypoints,
  root: "src",
  outdir: "build",
  target: "node",
  format: "cjs",
  packages: "external",
  // Keep public module paths and shared class identities intact.
  external: ["./*", "../*"],
  throw: false,
});

if (!result.success) {
  console.error(result.logs);
  process.exit(1);
}
