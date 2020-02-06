const _ = require('lodash');
const table = require('table').table;
const Shapefile = require('ginkgoch-shapefile').Shapefile;
const Utils = require('../shared/Utils');

module.exports = function(file, cmd) {
    const shapefile = new Shapefile(file);
    const pretty = cmd.pretty;
    shapefile.openWith(() => {
        let fields = Utils.getFields(shapefile);
        if (pretty) {
            fields = fields.map(f => { 
                let tmp = _.values(f);
                if(tmp.length == 3) {
                    tmp.push("");
                } 
                return tmp;
            });
            fields = [['name', 'type', 'length', 'decimal']].concat(fields);
            fields = table(fields);
        } else { 
            fields = JSON.stringify(fields);
        }

        console.log(fields);
    });
};