#!/usr/bin/env node
const program = require('commander');
const orpcCoverage = require('../build').default;
const { parseOpenRPCDocument } = require('@open-rpc/schema-utils-js');

const getSkipMethods = (input) => {
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
  .option('--skipMethods <skipMethods>', 'Methods to skip')
  .action(async () => {
    let schema;
    try {
      schema = await parseOpenRPCDocument(program.schema);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
    try {
      await orpcCoverage({
        openrpcDocument: schema,
        transport: program.transport,
        reporter: program.reporter,
        skipMethods: getSkipMethods(program.skipMethods)
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })
  .parse(process.argv);
