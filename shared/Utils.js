const _ = require('lodash');
const { Shapefile, ShapefileType, ShapefileFeatureSource, FeatureCollection, GeoUtils } = require('ginkgoch-map').default.all;

module.exports = class Utils {
    /**
     * @param {Shapefile} shapefile 
     */
    static getHeader(shapefile) {
        let header = _.cloneDeep(shapefile.header());
        header.fileType = _.findKey(ShapefileType, v => v === header.fileType);
        header.fileType = _.capitalize(header.fileType);
        return header;
    }

    /**
     * @param {Shapefile} shapefile 
     */
    static getFields(shapefile) {
        let fields = _.cloneDeep(shapefile.fields(true));
        return fields;
    }

    /**
     * @param {Shapefile} shapefile 
     */
    static getTotalCount(shapefile) {
        return shapefile.count();
    }

    /**
     * @param {Shapefile} shapefile 
     */
    static getFeatureCollectionJSON(shapefile, limit = undefined, featureCompressOptions = undefined) {
        const records = shapefile.iterator({ fields: 'all' });
        let record = undefined;
        let counter = 0;
        let features = new FeatureCollection();

        while ((record = records.next()) && !records.done) {
            if (!record.hasValue) continue;

            let feature = record.value;
            features.features.push(feature);
            
            counter++;
            if (limit !== undefined && counter >= limit) {
                break;
            }
        }

        const featureJSON = features.toJSON();
        featureJSON.features.forEach(f => delete f.geometry);
        return featureJSON;
    }
}