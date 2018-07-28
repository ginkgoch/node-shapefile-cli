const _ = require('lodash');
const Shapefile = require('ginkgoch-shapefile-reader');

async function loadRecords(file, cmd) {
    const limit = _.isUndefined(cmd.limit) ? 10 : cmd.limit;
    const columns = cmd.columns || 'all';
    const geom = cmd.geom || false;

    const shapefile = new Shapefile(file);
    await shapefile.openWith(async () => {
        const records = await shapefile.iterator(columns);
        let record = undefined;
        let counter = 0;
        while((record = await records.next()) && !record.done) {
            record = _.omit(record, ['done']);
            if(!geom) {
                record = _.omit(record, ['geom', 'envelope']);
            }

            console.log(JSON.stringify(record));
            counter++;

            if(limit !== 0 && counter >= limit) {
                break;
            }
        }

        const count = await shapefile.count();
        if(count > counter) {
            console.log(`Reading complete. ${count - counter}/${count} record(s) read`);
        }
    });
}

module.exports = function(file, cmd) {
    loadRecords(file, cmd);
}