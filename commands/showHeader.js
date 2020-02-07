const _ = require('lodash');
const table = require('table').table;
const { Shapefile, ShapefileType } = require('ginkgoch-shapefile');
const Utils = require('../shared/Utils');

module.exports = function(file, cmd) {
    const shapefile = new Shapefile(file);
    const pretty = cmd.pretty;
    shapefile.openWith(() => {
        let header = Utils.getHeader(shapefile);
        if (pretty) {
            header = table(_.entries(header));
        } else { 
            header = JSON.stringify(header);
        }

        console.log(header);
    });
};