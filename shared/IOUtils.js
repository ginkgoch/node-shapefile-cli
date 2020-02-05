const fs = require('fs');
const path = require('path');

module.exports = class IOUtils {
    static changeExtname(filePath, newExtname) {
        let extname = path.extname(filePath);
        return filePath.replace(extname, newExtname);
    }

    static cleanShapefile(filePath) {
        ['.shp', '.shx', '.dbf', '.idx', '.ids', '.prj']
            .map(ext => IOUtils.changeExtname(filePath, ext))
            .filter(f => fs.existsSync(f))
            .forEach(f => fs.unlinkSync(f));
    }
}