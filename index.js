#! /usr/bin/env node

const program = require('commander');

program.version('1.0.0').usage('command [options] <file>')
    .description('This is a command line tool to help to inspect a specified shapefile.');

program.command('show-header <file>')
    .description('Output shapefile header information')
    .option('-p, --pretty', 'output header with pretty table format')
    .action(require('./commands/showHeader'));

program.command('show-fields <file>')
    .description('Output shapefile fields information')
    .option('-p, --pretty', 'output fields with a pretty table format')
    .action(require('./commands/showFields'));

program.command('show-records <file>')
    .description('Output shapefile records information')
    .option('-l, --limit <n>', 'returning records limit. accept any number. 0 means all records. default to 10', parseInt)
    .option('-c, --columns <items>', 'returning columns include in the results. Multiple columns are supported by separater ",". Default to all columns', val => val.split(','))
    .option('-g, --geom', 'includes geometry in the returned content')
    .option('-p, --pretty', 'output records with a pretty table format')
    .action(require('./commands/showRecords'));

program.command('convert <file>')
    .description('Convert shapefile to another type - **not supported yet**')
    .option('-t, --type <value>', 'destination type to convert to. Supported types are json|csv|png')
    .option('-o, --output <value>', 'output file path. If only directory is specified, the same file name will be used. Default to the same folder of the source Shapefile')
    .action((file, cmd) => {
        console.log('unsupported yet! contact ginkgoch@outlook.com if needed');
    });

program.parse(process.argv);

