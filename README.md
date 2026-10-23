# OpenRPC Test Coverage
<center>
  <span>
    <img alt="GitHub Actions" src="https://github.com/open-rpc/test-coverage/actions/workflows/ci.yml/badge.svg?branch=master">
    <img src="https://codecov.io/gh/open-rpc/test-coverage/branch/master/graph/badge.svg" />
    <img alt="npm" src="https://img.shields.io/npm/dt/@open-rpc/test-coverage.svg" />
    <img alt="GitHub release" src="https://img.shields.io/github/release/open-rpc/test-coverage.svg" />
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/open-rpc/test-coverage/latest.svg" />
  </span>
</center>

This tool is meant to help you test your OpenRPC Document against an API.

Need help or have a question? Join us on [Discord](https://discord.gg/gREUKuF)!

## The Problem
Even after writing your OpenRPC Document, you want to test that the OpenRPC Document does represent an actual API.

## Solution

- generate fake data for the OpenRPC Documents method parameters schemas
- use example pairings when available
- use the servers[] defined in the OpenRPC Document to make the JSON-RPC API call
- report back the coverage results
- show errors and the result to help fix inconsistencies


## Extending with a `Rule`
Rules are a way to extend the test coverage tool to check for specific things when calling your JSON-RPC API. For example, you may want to check that some fields are always present in the result.  You can write a rule to check for that.

A rule is a class that extends the `Rule` class and implements the `getCalls` function. The `getCalls` function should return an array of calls to make to the JSON-RPC API. The `Rule` class will then make the calls and check the results. It checks the results with the `validateCall` function, it expects that you mutate the `call.valid` property to `true` if the call is valid, and `false` if the call is invalid.

Lastly there are lifecycle events that you can hook into to do things like setup and teardown. The `onBegin` function is called before any calls are made, and the `onEnd` function is called after all calls are made. There are also `beforeRequest`, `afterRequest`, and `afterResponse` lifecycle functions that are called before the request is made, after the request is made, and after the response is received respectively. See the [`Rule`](src/rules/rule.ts) interface for more information.

## Custom Reporters
You can write custom reporters to output the results of the test coverage tool in a different format. A reporter is a class that extends the `Reporter` class and implements the lifecycle functions. The `Reporter` class will call the lifecycle functions at the appropriate time. The `onBegin` function is called before any calls are made, and the `onEnd` function is called after all calls are made. There are also `onTestBegin` and `onTestEnd` lifecycle functions that are called before and after each test respectively. See the [`Reporter`](src/reporters/reporter.ts) interface for more information.

### Installation:

```

bun add --global @open-rpc/test-coverage

```

Requires Bun 1.4.2 or later. The CLI runs with Bun. The built library supports
Node.js 22.14.0 or later and uses native `fetch`.

### Library

The library is ESM only. Use `import` instead of `require()`:

```js
import testCoverage from "@open-rpc/test-coverage";

const calls = await testCoverage({
  openrpcDocument,
  transport: "http",
  reporters: ["console"],
});
```

Custom rules and reporters can import modules from `build/` with a `.js` extension:

```js
import Rule from "@open-rpc/test-coverage/build/rules/rule.js";
```

TypeScript types ship with the package. Use `NodeNext` module resolution in
Node.js projects, or `Bundler` in projects that use a bundler.

### Breaking changes

The library no longer provides CommonJS modules. Change `require()` calls to
ESM imports and add `.js` to imports from `build/`. The CLI requires Bun on
`PATH`. The library requires Node.js 22.14.0 or later, or Bun 1.4.2 or later.

### Development

```sh
bun install --frozen-lockfile
bun run test
bun run build
```

`bun test` runs the unit tests. `bun run test` also writes coverage to
`coverage/lcov.info`, runs ESLint, and checks types. Use `bun run lint` or
`bun run typecheck` to run those checks on their own.

`bun run build` uses Bun to build ESM modules in `build/`. TypeScript emits
the `.d.ts` files. Test files are excluded from the build. Run the local CLI with
`bun bin/cli.js --help` after building.

GitHub Actions runs the tests, lint, type checks, and build for pull requests and
pushes to `master`. Actions are pinned to commit SHAs, and the Codecov uploader
version is pinned. Codecov uses GitHub OIDC, so no Codecov secret is needed.
Fork and Dependabot pull requests run all checks but skip the coverage upload.

### Releases

Releases require a manual run and use npm trusted publishing with GitHub OIDC.
The package's trusted publisher must point to `open-rpc/test-coverage` and the
workflow filename `ci.yml`, allow direct publishing, and leave the environment
name blank. No npm token secret is needed. GitHub supplies `GITHUB_TOKEN`
automatically for release notes and tags.

After merging to `master`, open **Actions → CI → Run workflow** and select
`master`. The release job runs only for this manual event on `master`, after
tests and build pass. A normal push or pull request does not publish a package.
The release job grants `id-token: write`, uses the Node.js version in
`.node-version` for npm publishing, and runs `bun run release`. The release tool
and its dependencies are pinned in `bun.lock`.


### Usage:


```
open-rpc-test-coverage -s https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/simple-math-openrpc.json --transport=http --reporters=console --skip=addition
```



#### Screenshot

##### console reporter

![image](https://user-images.githubusercontent.com/364566/56318521-3e103300-6114-11e9-85cd-f35eb7b42a0e.png)
