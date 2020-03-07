const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const IOUtils = require('../shared/IOUtils');
const SrsUtils = require('../shared/SrsUtils');

const { ShapefileFeatureSource, Srs, ShapefileType, RTRecordType, RTIndex, Point } = require('ginkgoch-map').default.all;

module.exports = async (file, cmd) => {
    if (!fs.existsSync(file)) {
        console.error('[Error]', `${path.basename(file)} doesn't exist`);
    }

    let options = _.pick(cmd, 'overwrite', 'output', 'outputSrs', 'sourceSrs');
    if (options.outputSrs === undefined) {
        console.error('[Error]', 'Output SRS is not defined. Please set the "--outputSrs" for target SRS');
        return;
    }

    options = _.defaults(options, { overwrite: false, output: getDefaultOutput(file, options.outputSrs) });

    if (fs.existsSync(options.output)) {
        if (options.overwrite) {
            IOUtils.cleanShapefile(options.output);
        } else {
            console.info('[Ignore]', 'Output file exists, please use another output filename');
            return;
        }
    }

    let source = new ShapefileFeatureSource(file);
    await source.open();
    await setDefaultSrs(source, options);
    if (source.projection.from === undefined) {
        console.error('[Error]', 'Shapefile source SRS is undefined and unable to detected, please set "--sourceSrs"');
        return;
    }

    await source.close();
    await source.open();

    const recordType = source.shapeType === ShapefileType.point ? RTRecordType.point : RTRecordType.rectangle;
    const recordCount = await source.count();
    const pageSize = RTIndex.recommendPageSize(recordCount);

    const idxFilePath = IOUtils.changeExtname(options.output, '.idx');
    RTIndex.create(idxFilePath, recordType, { pageSize });
    const index = new RTIndex(idxFilePath, 'rs+');
    index.open();

    const target = await source.copySchemaAs(options.output);
    await target.open();

    let i = 0;
    const features = await source.features();
    let featureCount = features.length;
    try {
        for(let feature of features) {
            await target.push(feature);
            pushIndexRecord(index, feature, recordType);
            i++;

            process.stdout.write(`[Building] - ${i}/${featureCount}\r`);
        }

        process.stdout.write(`[Building] - Fetching projection info for ${options.outputSrs}\r`);
        let wkt = await SrsUtils.getWKT(options.outputSrs);
        if (wkt !== undefined) {
            let prjFilePath = IOUtils.changeExtname(options.output, '.prj');
            fs.writeFileSync(prjFilePath, wkt);
        } else {
            console.warn(`[Warning] - Fetching projection info for ${options.outputSrs} failed`);
        }

        console.log(`[Done] ${path.basename(file)} re-projected with ${index.count()} records complete`);
    } catch (ex) {
        console.error('[Error]', ex);
        IOUtils.cleanShapefile(options.output);
    } finally {
        index.close();
        await target.close();
        await source.close();
    }
};

function getDefaultOutput(filePath, srs) {
    let dirname = path.dirname(filePath);
    let extname = path.extname(filePath);
    let basename = path.basename(filePath, extname);

    let defaultOutput = path.join(dirname, `${basename}_${normalizeSrsSuffix(srs)}${extname}`);
    return defaultOutput;
}

function normalizeSrsSuffix(srs) {
    if (srs.includes(':')) {
        srs = srs.split(':')[1];
    }
    return srs;
}

async function setDefaultSrs(source, options) {
    source.projection.to = new Srs(options.outputSrs);
    if (source.projection.from === undefined || source.projection.from.projection === undefined) {
        if (options.sourceSrs !== undefined) {
            source.projection.from = new Srs(options.sourceSrs);
        } else {
            const envelope = await source.envelope();
            const envelopeSize = getEnvelopeSize(envelope);
            if (envelopeSize.w <= 360 && envelopeSize.h <= 180) {
                source.projection.from = new Srs('WGS84');
            } 
        }
    }
}

function getEnvelopeSize(envelope) {
    let [w, h] = [Math.abs(envelope.maxx - envelope.minx), Math.abs(envelope.maxy - envelope.miny)];
    return { w, h };
}

function pushIndexRecord(index, feature, recordType) {
    if (recordType === RTRecordType.rectangle) {
        const geom = feature.envelope();
        index.push(geom, feature.id.toString());
    }
    else {
        const center = feature.envelope().centroid();
        const geom = new Point(center.x, center.y)
        index.push(geom, feature.id.toString());
    }
}