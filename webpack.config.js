const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: path.join(__dirname, 'client', 'content'),
    watch: false,
    output: {
        path: path.join(__dirname, 'dist', 'assets'),
        filename: "bundle.js",
    },
    plugins: [
        new CopyPlugin([
            { from: './node_modules/bootstrap/dist/css/bootstrap.min.css', to: '.' },
            { from: './node_modules/leaflet/dist/leaflet.css', to: '.' },
            { from: './client/content.css', to: '.' },
            { from: './node_modules/leaflet/dist/images/', to: './images/' },
        ])
    ],
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