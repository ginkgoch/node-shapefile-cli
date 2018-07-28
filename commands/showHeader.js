const _ = require('lodash');
const table = require('table').table;
const Shapefile = require('ginkgoch-shapefile-reader').Shapefile;
const ShapefileType = require('ginkgoch-shapefile-reader').ShapefileType;

module.exports = async function(file, cmd) {
    const shapefile = new Shapefile(file);
    const pretty = cmd.pretty;
    await shapefile.openWith(async () => {
        let header = _.cloneDeep(shapefile.header());
        header.fileType = _.findKey(ShapefileType, v => v === header.fileType);
        header.fileType = _.capitalize(header.fileType);
        if (pretty) {
            header.minx = header.envelope.minx;
            header.miny = header.envelope.miny;
            header.maxx = header.envelope.maxx;
            header.maxy = header.envelope.maxy;
            delete header.envelope;
            header = table(_.entries(header));
        } else { 
            header = JSON.stringify(header);
        }

        console.log(header);
    });
};