const path = require('path');

module.exports = {
    mode: 'production',
    entry: path.join(__dirname, 'client', 'content'),
    watch: false,
    output: {
        path: path.join(__dirname, 'dist', 'assets'),
        filename: "bundle.js",
    },
    module: {
        rules: [{
            test: /.jsx?$/,
            include: [
                path.resolve(__dirname, 'ui', 'assets')
            ],
            exclude: [
                path.resolve(__dirname, 'node_modules')
            ],
            loader: 'babel-loader',
            query: {
                presets: [
                    ["@babel/preset-env", {
                        "targets": { "browsers": ["last 2 chrome versions"] }
                    }]
                ]
            }
        },
        {
            test: /\.css$/,
            loader: ['style-loader', 'css-loader']
        },
        {
            test: /\.png$/,
            loader: 'url-loader'
        }
        ]
    },
    optimization: {
        minimize: true
    },
    resolve: {
        extensions: ['.json', '.js', '.jsx']
    },
    devtool: 'source-map'
};