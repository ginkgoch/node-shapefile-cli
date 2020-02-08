const fs = require('fs');
const path = require('path');
const Router = require('@koa/router');
const { ShapefileFeatureSource, GeoUtils, Unit, Srs, ViewportUtils, FeatureCollection } = require('ginkgoch-map').default.all;
const Utils = require('../shared/Utils');

let currentFilePaths = [];
let currentFilePath = undefined;
const validateExtnames = ['.shp', '.shx', '.dbf'];

module.exports = file => {
    if (fs.lstatSync(file).isDirectory) {
        const filenames = fs.readdirSync(file).filter(f => path.extname(f).toLowerCase() === '.shp').map(f => path.resolve(file, f)).filter(f => {
            let currentExtname = path.extname(f);
            let isValid = validateExtnames.every(ext => fs.existsSync(f.replace(currentExtname, ext)));
            return isValid;
        });

        currentFilePaths = filenames;
    } else {
        currentFilePaths = [file];
    }

    if (currentFilePaths.length > 0) {
        currentFilePath = currentFilePaths[0];
    } else {
        console.error('Cannot found any valid shapefiles.');
        return null;
    }

    const router = new Router();
    router.get('/', async ctx => {
        const source = new ShapefileFeatureSource(currentFilePath);
        await source.open();

        try {
            const shapefile = source.__shapefile;
            const overview = {};
            overview.name = path.basename(currentFilePath);
            overview.filePath = currentFilePath;
            overview.filePaths = currentFilePaths;
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

    router.post('/', async (ctx) => {
        const filePath = ctx.request.body.filePath;
        const fileName = path.basename(filePath);
        if (!fs.existsSync(filePath)) {
            ctx.throw(404, `File ${fileName} not found.`);
        }

        if (this.filePath === currentFilePath) {
            ctx.throw(409, `File ${ path.basename(filePath) } is opened. Please choose another file.`);
        }

        currentFilePath = filePath;
        ctx.type = 'json';
        ctx.body = { status: 'success' };
    });

    router.get('/viewport', async ctx => {
        let { width, height } = ctx.query;

        const source = new ShapefileFeatureSource(currentFilePath);
        await source.open();

        try {
            await setProperProjection(source);

            let envelope = await source.envelope();
            const scale = GeoUtils.scale(envelope, Unit.degrees, { width, height });
            const zoom = GeoUtils.scaleLevel(scale) - 1;

            const [lng, lat] = [.5 * (envelope.minx + envelope.maxx), .5 * (envelope.miny + envelope.maxy)];
            ctx.type = 'json';
            ctx.body = { lng, lat, zoom };
        }
        finally {
            await source.close();
        }
    });

    router.get('/features', async ctx => {
        let { width, height } = ctx.query;

        const source = new ShapefileFeatureSource(currentFilePath);
        await source.open();

        try {
            await setProperProjection(source);
            let features = await source.features();

            let envelope = await source.envelope();
            const scale = GeoUtils.scale(envelope, Unit.degrees, { width, height });

            features = ViewportUtils.compressFeatures(features, 'WGS84', scale, 2);
            const featureCollection = new FeatureCollection(features).toJSON();

            ctx.type = 'json';
            ctx.body = { features: featureCollection };
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
        if (Math.abs(envelope.maxx - envelope.minx) <= 360 && Math.abs(envelope.maxy - envelope.miny)) {
            source.projection.from = new Srs('WGS84');
        } else {
            source.projection.from = new Srs('EPSG:900913');
        }
    }

    source.projection.to = new Srs('WGS84');
}