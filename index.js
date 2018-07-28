#! /usr/bin/env node

const program = require('commander');

program.version('1.0.0').usage('command [options] <file>')
    .description('this is a command line tool to help to inspect a specified shapefile.');

program.command('show-header <file>')
    .description('output a specified shapefile header information')
    .option('-s, --stringify', 'output header with stringify data')
    .action(require('./commands/showHeader'));

program.command('show-records <file>')
    .description('output a specified shapefile records information')
    .option('-l, --limit <n>', 'returning records limit. Default to 0 means all records', parseInt)
    .option('-c, --columns <items>', 'returning columns include in the results. Multiple columns are supported by separater ",". Default to all columns', val => val.split(','))
    .option('-g, --geom', 'includes geometry in the returned table')
    .action((file, cmd) => {
        console.log(file, cmd.limit, cmd.columns.length);
    });

program.command('convert <file>')
    .description('convert a specified shapefile to another type')
    .option('-t, --type <value>', 'destination type to convert to. Supported types are json|csv|png')
    .option('-o, --output <value>', 'output file path. If only directory is specified, the same file name will be used. Default to the same folder of the source Shapefile')
    .action((file, cmd) => {
        console.log(file, cmd.type, cmd.columns.output);
    });

program.parse(process.argv);

