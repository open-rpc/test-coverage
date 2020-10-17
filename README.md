# OpenRPC Test Coverage
<center>
  <span>
    <img alt="CircleCI branch" src="https://img.shields.io/circleci/project/github/open-rpc/test-coverage/master.svg">
    <img src="https://codecov.io/gh/open-rpc/test-coverage/branch/master/graph/badge.svg" />
    <img alt="Dependabot status" src="https://api.dependabot.com/badges/status?host=github&repo=open-rpc/test-coverage" />
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

### Installation:

```

npm install -g @open-rpc/test-coverage

```


### Usage:


```
open-rpc-test-coverage -s https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/simple-math-openrpc.json --transport=http --reporter=console --skipMethods=addition
```



#### Screenshot

##### console reporter

![image](https://user-images.githubusercontent.com/364566/56318521-3e103300-6114-11e9-85cd-f35eb7b42a0e.png)
