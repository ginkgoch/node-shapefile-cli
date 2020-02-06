const Koa = require('koa');
const static = require('koa-static');
const path = require('path');
const fs = require('fs');
const ejs = require('koa-ejs');
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
    server.use(static('./ui'));
    server.use(router.routes()).use(router.allowedMethods());
    server.listen(port, () => {
        console.log(`Server is hosted on http://localhost:${port}.\nPress CTRL+C to quit.`)
    });
};