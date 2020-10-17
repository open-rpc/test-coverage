# OpenRPC Test Coverage

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
