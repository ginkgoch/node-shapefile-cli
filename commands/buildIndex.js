const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { Shapefile, RTIndex, RTRecordType, ShapefileType, Point } = require('ginkgoch-map').default.all;

const INDEX_EXTENSIONS = ['.idx', '.ids'];

module.exports = (fileOrDir, cmd) => {
    if (!fs.existsSync(fileOrDir)) {
        console.log('[Error] Target file or directory doesn\'t exist');
        return;
    }

    let files = getFilesToBuild(fileOrDir);
    let overwrite = _.defaultTo(cmd.overwrite, false);

    for (let file of files) {
        buildIndex(file, overwrite);
        console.log();
    }
}

function isDirectory(fileOrDir) {
    let st = fs.lstatSync(fileOrDir);
    return st.isDirectory();
}

function getFilesToBuild(fileOrDir) {
    let isDir = isDirectory(fileOrDir);
    if (!isDir) {
        return [fileOrDir];
    } else {
        let files = fs.readdirSync(fileOrDir).map(f => path.resolve(fileOrDir, f));
        return files;
    }
}

function buildIndex(filePath, override) {
    let currentExt = path.extname(filePath);
    let indexFilePaths = INDEX_EXTENSIONS.map(ext => filePath.replace(currentExt, ext));

    if (override) {
        indexFilePaths.filter(f => fs.existsSync(f)).forEach(f => fs.unlinkSync(f));
    }

    if (!override && _.every(indexFilePaths, f => fs.existsSync(f))) {
        console.log('[Ignored] Index files exist. No need to build. If you want to build anyway, please use "-w" or "--overwrite" to overwrite the existing index files.');
        return;
    }
    
    let shapefile = new Shapefile(filePath);
    shapefile.open();
    
    const recordType = shapefile.shapeType() === ShapefileType.point ? RTRecordType.point : RTRecordType.rectangle;
    const recordCount = shapefile.count();
    const pageSize = RTIndex.recommendPageSize(recordCount);
    
    let indexFilePath = filePath.replace(currentExt, '.idx');
    RTIndex.create(indexFilePath, recordType, { pageSize });
    const index = new RTIndex(indexFilePath, 'rs+');
    index.open();

    try {
        let i = 0;
        const iterator = shapefile.iterator({ fields: [] });
        while (!iterator.done) {
            let record = iterator.next();
            if (record.hasValue && record.value !== null) {
                pushIndexRecord(index, record.value, recordType);
                i++;

                if (i % 32 === 0) {
                    process.stdout.write(`[Building] - ${i}/${recordCount}\r`);
                }
            }
        }

        console.log(`[Done] ${path.basename(filePath)} index with ${index.count()} records build complete.`);
    }
    catch (ex) {
        console.error('[Error]', ex);
        indexFilePaths.filter(f => fs.existsSync(f)).forEach(f => fs.unlinkSync(f));
    } 
    finally {
        shapefile.close();
        index.close();
    }
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