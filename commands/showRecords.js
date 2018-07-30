const _ = require('lodash');
const table = require('table').table;
const Shapefile = require('ginkgoch-shapefile-reader').Shapefile;
const truncateOption = { length: 30 };

module.exports = async function(file, cmd) {
    const limit = _.isUndefined(cmd.limit) ? 10 : cmd.limit;
    const columns = cmd.columns || 'all';
    const geom = cmd.geom || false;

    const shapefile = new Shapefile(file);
    await shapefile.openWith(async () => {
        const records = await shapefile.iterator({ fields: columns });
        let record = undefined;
        let counter = 0;
        let headers = undefined;
        let tableData = undefined;

        while ((record = await records.next()) && !record.done) {
            record = _.omit(record, ['done']);
            if (!geom) {
                record = _.omit(record, ['geom', 'envelope']);
            }

            if (cmd.pretty) {
                if (!headers) {
                    headers = _.keys(record.fields);
                    cmd.geom && headers.push('geom');
                    tableData = [ headers ];
                }

                let row = _.values(record.fields);
                cmd.geom && row.push(_.truncate(JSON.stringify(record.geom), truncateOption));
                tableData.push(row);
            } else {
                console.log(JSON.stringify(record));
                console.log('');
            }
            counter++;

            if (limit !== 0 && counter >= limit) {
                break;
            }
        }

        if (tableData) {
            console.log(table(tableData));
        }

        const count = await shapefile.count();
        if (count > counter) {
            console.log(`Reading complete. ${counter}/${count} record(s)`);
        }

        console.log(`Tips:`);
        console.log(` - set option -l, --limit to 0 to read all records`);
        console.log(` - use option -g, --geom to 0 to read all records with geometry`);
        console.log(` - use option -p, --pretty to return data with pretty table format`);
        console.log(` - use option -c, --column to return necessary fields. e.g. -c field1,field2 returns two fields`);
    });
}