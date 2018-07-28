const Shapefile = require('ginkgoch-shapefile-reader');

async function loadHeader(file, stringify) {
    const shapefile = new Shapefile(file);
    await shapefile.openWith(async () => {
        let header = shapefile.header();
        if(stringify) header = JSON.stringify(header);

        console.log(header);
    });
}

module.exports = function(file, cmd) {
    loadHeader(file, cmd.stringify);
}