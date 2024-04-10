#!/usr/bin/env node
const program = require('commander');
const orpcCoverage = require('../build').default;
const { parseOpenRPCDocument } = require('@open-rpc/schema-utils-js');

const getArrayFromCommaSeparated = (input) => {
  if (input && input.split(',').length > 0) {
    return input.split(',');
  } else {
    return null;
  }
}

program
  .version(require('./get-version'))
  .usage('[options]')
  .option('-s, --schema [schema]', 'JSON string or a Path/Url pointing to an open rpc schema')
  .option('-r, --reporters <reporter>', 'Use the specified reporter [console] [json] [empty]. Can be a comma separated list of reporters.')
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
