#! /usr/bin/env node

const program = require('commander');

program.version('1.0.0').usage('command [options] <file>')
    .description('This is a command line tool to help to inspect a specified shapefile.');

program.command('show-header <file>')
    .description('Prints a specified shapefile header information')
    .action(file => {
        console.log(file);
    });

program.command('show-records <file>')
    .description('Prints a specified shapefile records information')
    .option('-l, --limit <n>', 'Returning records limit. Default to 0 means all records', parseInt)
    .option('-c, --columns <items>', 'Returning columns include in the results. Multiple columns are supported by separater ",". Default to all columns', val => val.split(','))
    .action((file, cmd) => {
        console.log(file, cmd.limit, cmd.columns.length);
    });

program.command('convert <file>')
    .description('Converts a specified shapefile to another type.')
    .option('-t, --type <value>', 'Destination type to convert to. Supported types are json|csv|png')
    .option('-o, --output <value>', 'Output file path. If only directory is specified, the same file name will be used. Default to the same folder of the source Shapefile')
    .action((file, cmd) => {
        console.log(file, cmd.type, cmd.columns.output);
    });

program.parse(process.argv);

