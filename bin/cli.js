#!/usr/bin/env bun
import { program } from 'commander';
import orpcCoverage from '../build/index.js';
import { parseOpenRPCDocument } from '@open-rpc/schema-utils-js';
import packageJson from '../package.json' with { type: 'json' };

const getArrayFromCommaSeparated = (input) => {
  if (!input) {
    return [];
  }
  return input.split(',');
}

program
  .version(packageJson.version)
  .usage('[options]')
  .option('-s, --schema [schema]', 'JSON string or a Path/Url pointing to an open rpc schema')
  .option('-r, --reporters <reporters>', 'Use the specified reporter [console] [console-rule] [console-streaming] [json] [empty] [html]. Can be a comma separated list of reporters.')
  .option('-t, --transport <transport>', 'Use the specified transport [http]')
  .option('--skip <skip>', 'Methods to skip. Comma separated list of method names')
  .option('--only <only>', 'Methods to only run. Comma separated list of method names')
  .action(async (options) => {
    let schema;
    try {
      schema = await parseOpenRPCDocument(options.schema);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    try {
      await orpcCoverage({
        openrpcDocument: schema,
        transport: options.transport,
        reporters: getArrayFromCommaSeparated(options.reporters),
        skip: getArrayFromCommaSeparated(options.skip),
        only: getArrayFromCommaSeparated(options.only),
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })
  .parse(process.argv);
