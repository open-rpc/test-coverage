# OpenRPC Test Coverage

This tool is meant to help you test your OpenRPC Document against an API.


## The Problem
Even after writing your OpenRPC Document, you want to test that the OpenRPC Document does represent an actual API.


## Solution

- generate fake data for the OpenRPC Documents method parameters schemas
- use example pairings when available
- use the servers[] defined in the OpenRPC Document to make the JSON-RPC API call
- report back the coverage results
- show errors and the result to help fix inconsistencies
