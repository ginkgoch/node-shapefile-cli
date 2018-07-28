const _ = require('lodash');
const table = require('table').table;
const Shapefile = require('ginkgoch-shapefile-reader');

module.exports = async function(file, cmd) {
    const shapefile = new Shapefile(file);
    const pretty = cmd.pretty;
    await shapefile.openWith(async () => {
        let header = _.cloneDeep(shapefile.header());
        if (pretty) {
            header.envelope = JSON.stringify(header.envelope);
            header = table(_.entries(header));
        } else { 
            header = JSON.stringify(header);
        }

        console.log(header);
    });
};