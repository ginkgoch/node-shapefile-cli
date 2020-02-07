const Koa = require('koa');
const static = require('koa-static');
const path = require('path');
const fs = require('fs');
const ejs = require('koa-ejs');
const compress = require('koa-compress');
const getRouter = require('../routers');

module.exports = (file, cmd) => {
    let port = cmd.port || 3000;
    if (!fs.existsSync(file)) {
        console.error('[Error]', `File ${path.basename(file)} doesn't exist, please set a valid shapefile path and try again.`);
    }
    
    const server = new Koa();
    ejs(server, {
        root: path.resolve(__dirname, '../templates'),
        viewExt: 'ejs',
        cache: false,
        debug: false,
        layout: false
    });

    let router = getRouter(file);
    server.use(compress({
        filter: function (content_type) {
            return /json/i.test(content_type)
        },
        threshold: 2048,
        flush: require('zlib').Z_SYNC_FLUSH
      }))
    server.use(static(path.resolve(__dirname, '../dist')));
    server.use(router.routes()).use(router.allowedMethods());
    server.listen(port, () => {
        console.log(`Server is hosted on http://localhost:${port}.\nPress CTRL+C to quit.`)
    });
};