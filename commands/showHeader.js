const _ = require('lodash');
const table = require('table').table;
const { Shapefile, ShapefileType } = require('ginkgoch-shapefile');

module.exports = function(file, cmd) {
    const shapefile = new Shapefile(file);
    const pretty = cmd.pretty;
    shapefile.openWith(() => {
        let header = _.cloneDeep(shapefile.header());
        header.fileType = _.findKey(ShapefileType, v => v === header.fileType);
        header.fileType = _.capitalize(header.fileType);
        if (pretty) {
            header.minx = header.minx;
            header.miny = header.miny;
            header.maxx = header.maxx;
            header.maxy = header.maxy;
            header = table(_.entries(header));
        } else { 
            header = JSON.stringify(header);
        }

        console.log(header);
    });
};