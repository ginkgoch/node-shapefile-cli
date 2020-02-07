#! /usr/bin/env node

let program = require('commander');

program = new program.Command();

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
    .option('-c, --columns <items>', 'returning columns include in the results. Multiple columns are supported by separator ",". Default to all columns', val => val.split(','))
    .option('-g, --geom', 'includes geometry in the returned content')
    .option('-p, --pretty', 'output records with a pretty table format')
    .action(require('./commands/showRecords'));

program.command('convert-geojson <file>')
    .description('Convert shapefile to GeoJson')
    .option('-c, --columns <items>', 'returning columns include in the results. Multiple columns are supported by separator ",". Default to all columns', val => val.split(','))
    .option('-o, --output <value>', 'output file path. If only directory is specified, the same file name will be used. Default to the same folder of the source Shapefile')
    .action(require('./commands/convertGeoJson'));

program.command('build-index <fileOrDir>')
    .description('Build index for shapefile')
    .option('-w, --overwrite', 'overwrite if index files exist. Default is "false"')
    .action(require('./commands/buildIndex'));

program.command('reproject <file>')
    .description('Re-project shapefile to a specific SRS')
    .option('--outputSrs <outputSrs>', '[Required] The target SRS. It is required')
    .option('--sourceSrs <sourceSrs>', 'the source SRS. If .prj file doesn\'t exist, this option will be applied as source SRS')
    .option('-o, --output <output>', 'the output shapefile path. Default is the source file name with "_[targetSRS]" suffix')
    .option('-w, --overwrite', 'overwrite if index files exist. Default is "false"')
    .action(require('./commands/reproject'));

program.command('serve <file>')
    .description('Launch a server for exploring shapefile on browser')
    .option('-p, --port <port>', 'the server port exposed to browse, default port is 3000')
    .action(require('./commands/serve'));

program.parse(process.argv);

if (program.rawArgs.length < 3) {
    program.help();
}

