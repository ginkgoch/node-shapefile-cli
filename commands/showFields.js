const _ = require('lodash');
const table = require('table').table;
const Shapefile = require('ginkgoch-shapefile-reader').Shapefile;

module.exports = async function(file, cmd) {
    const shapefile = new Shapefile(file);
    const pretty = cmd.pretty;
    await shapefile.openWith(async () => {
        let fields = _.cloneDeep(shapefile.fields(true));
        if (pretty) {
            fields = fields.map(f => { 
                let tmp = _.values(f);
                if(tmp.length == 3) {
                    tmp.push(NaN);
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