#!/usr/bin/env node
const program = require('commander');
const orpcCoverage = require('../build').default;
const { parseOpenRPCDocument } = require('@open-rpc/schema-utils-js');

const getMethodsArray = (input) => {
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
  .option('-r, --reporter <reporter>', 'Use the specified reporter [console] [json]')
  .option('-t, --transport <transport>', 'Use the specified transport [http]')
  .option('--skip <skip>', 'Methods to skip')
  .option('--only <only>', 'Methods to only run')
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
        reporter: options.reporter,
        skip: getMethodsArray(options.skip),
        only: getMethodsArray(options.only),
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })
  .parse(process.argv);
