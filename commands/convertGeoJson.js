const fs = require('fs');
const _ = require('lodash');
const Shapefile = require('ginkgoch-shapefile').Shapefile;

module.exports = function(file, cmd) {
    const columns = cmd.columns || 'all';

    const shapefile = new Shapefile(file);
    let outputPath = cmd && cmd.output;
    if (!outputPath) {
        outputPath = file.replace(/\.\w+$/, '.json');
    } else if (outputPath.endsWith('.json')) {
        outputPath = outputPath.slice(0, outputPath.lastIndexOf('.')) + '.json';
    }

    shapefile.openWith(() => {
        const records = shapefile.iterator({ fields: columns });
        let record = undefined;

        const featureCollection = { type: 'FeatureCollection' };
        const features = [];
        while ((record = records.next()) && !records.done) {
            record = record.value;
            features.push(record);
        }

        featureCollection.features = features;
        const jsonContent = JSON.stringify(featureCollection, null, 2);
        try {
            fs.writeFileSync(outputPath, jsonContent, { encoding: 'utf8' });
            console.log(`Conversion complete. New file is saved at ${outputPath}.`);
        } catch (err) {
            console.log(err);
        }
    });
}