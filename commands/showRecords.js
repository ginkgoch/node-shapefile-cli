const _ = require('lodash');
const table = require('table').table;
const Shapefile = require('ginkgoch-shapefile').Shapefile;
const truncateOption = { length: 30 };

function getRecordJSON(record, requireGeom) {
    let recordJSON = record.toJSON();
    let type = recordJSON.type

    if (!requireGeom) {
        recordJSON = _.omit(recordJSON, ['geometry', 'envelope', 'type']);
    }

    if (type) {
        recordJSON.type = type;
    }

    return recordJSON;
}

module.exports = function (file, cmd) {
    const limit = _.isUndefined(cmd.limit) ? 10 : cmd.limit;
    const columns = cmd.columns || 'all';
    const geom = cmd.geom || false;

    const shapefile = new Shapefile(file);
    shapefile.openWith(() => {
        const records = shapefile.iterator({ fields: columns });
        let record = undefined;
        let counter = 0;
        let headers = undefined;
        let tableData = undefined;

        while ((record = records.next()) && !records.done) {
            if (!record.hasValue) continue;

            record = record.value;
            if (cmd.pretty) {
                if (!headers) {
                    headers = Array.from(record.properties.keys());
                    cmd.geom && headers.push('geom');
                    tableData = [headers];
                }

                let recordJSON = getRecordJSON(record, geom);
                let row = Array.from(record.properties.values());
                cmd.geom && row.push(_.truncate(JSON.stringify(recordJSON.geometry), truncateOption));
                tableData.push(row);
            } else {
                let recordJSON = getRecordJSON(record, geom);
                console.log(JSON.stringify(recordJSON));
                console.log();
            }
            counter++;

            if (limit !== 0 && counter >= limit) {
                break;
            }
        }

        if (tableData) {
            console.log(table(tableData));
        }

        const count = shapefile.count();
        if (count > counter) {
            console.log(`Reading complete. ${counter}/${count} record(s)`);
        }

        console.log();
        console.log(`Tips:`);
        console.log(` - set option -l, --limit to 0 to read all records`);
        console.log(` - use option -g, --geom to 0 to read all records with geometry`);
        console.log(` - use option -p, --pretty to return data with pretty table format`);
        console.log(` - use option -c, --column to return necessary fields. e.g. -c field1,field2 returns two fields`);
    });
}