const path = require('path');
const Router = require('@koa/router');
const { ShapefileFeatureSource, GeoUtils, Unit, Srs, ViewportUtils, FeatureCollection } = require('ginkgoch-map').default.all;
const Utils = require('../shared/Utils');

module.exports = file => {
    const router = new Router();
    router.get('/', async ctx => {
        const source = new ShapefileFeatureSource(file);
        await source.open();

        try {
            const shapefile = source.__shapefile;
            const overview = {};
            overview.name = path.basename(file);
            overview.filePath = file;
            overview.header = Utils.getHeader(shapefile);
            overview.features = Utils.getFeatureCollectionJSON(shapefile, 20);
            overview.fields = Utils.getFields(shapefile);
            overview.totalCount = Utils.getTotalCount(shapefile);
        
            await ctx.render('index', { overview });
        }
        finally {
            await source.close();
        }
    });

    router.get('/viewport', async ctx => {
        let { width, height } = ctx.query;

        const source = new ShapefileFeatureSource(file);
        await source.open();

        try {
            await setProperProjection(source);

            let envelope = await source.envelope();
            const scale = GeoUtils.scale(envelope, Unit.degrees, { width, height });
            const zoom = GeoUtils.scaleLevel(scale) - 1;

            const features = await source.features();
            features.forEach(f => f.geometry = ViewportUtils.compressGeometry(f.geometry, 'WGS84', scale, 1));
            const featureCollection = new FeatureCollection(features).toJSON();

            const [ lng, lat ] = [.5 * (envelope.minx + envelope.maxx), .5 * (envelope.miny + envelope.maxy)];
            ctx.type = 'json';
            ctx.body = { lng, lat, zoom, features: featureCollection };
        }
        finally {
            await source.close();
        }
    });

    return router;
};

/**
 * @param {ShapefileFeatureSource} source 
 * @param {minx: number, maxx: number, miny: number, maxy: number} envelope 
 */
async function setProperProjection(source) {
    if (source.projection.from === undefined || source.projection.from.projection === undefined) {
        let envelope = await source.envelope();
        if(Math.abs(envelope.maxx - envelope.minx) <= 360 && Math.abs(envelope.maxy - envelope.miny)) {
            source.projection.from = new Srs('WGS84');
        } else {
            source.projection.from = new Srs('EPSG:900913');
        }
    }

    source.projection.to = new Srs('WGS84');
}