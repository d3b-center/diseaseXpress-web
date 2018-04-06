var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var webpack = require('webpack');
const dotenv   = require('dotenv');
const path     = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

const isDev = NODE_ENV === 'development';
const isTest = NODE_ENV === 'test';

const join     = path.join;
const resolve  = path.resolve;

// devServer config
const devHost  = process.env.HOST || 'localhost';
const devPort  = process.env.PORT || 4000;

const root     = resolve(__dirname);
const src      = join(root, 'src');
const modules  = join(root, 'node_modules');

const fontPath = 'reactapp/[hash].[ext]';
const imgPath  = 'reactapp/images/[hash].[ext]';

var sassResourcesLoader =  {
                                loader:'sass-resources-loader',
                                    options: {
                                    resources:[
                                        path.resolve(__dirname, 'node_modules/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss'),
                                        path.resolve(__dirname, 'node_modules/bootstrap-sass/assets/stylesheets/bootstrap/_mixins')
                                    ]
                                    }
                            };

var config = {

    'entry': [
        `babel-polyfill`,
       // 'bootstrap-loader',
        `./src/router.jsx`,
        'font-awesome-webpack'
    ],
    // 'output': {
    //     path: path.resolve(__dirname, 'dist'),
    //     filename: "bundle.js"
    // },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'reactapp/[name].app.js',
        chunkFilename: 'reactapp/[name].[chunkhash].chunk.js',
       // cssFilename: 'reactapp/app.css',
       // hash: false,
        publicPath: '/',
    },

    'resolve': {
        'extensions': [
            '.js',
            '.jsx',
            '.json',
            '.ts',
            '.tsx',
        ],
        'modules': [
            src,
            modules
        ]
    },
    devtool: "source-map",

    plugins: [
        new HtmlWebpackPlugin({cache: false, template: 'index.html'}),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new webpack.IgnorePlugin(/vertx/),
        new webpack.DllReferencePlugin({
            context: '.',
            manifest: require('./common-dist/common-manifest.json')
        }),
        new CopyWebpackPlugin([
            {from: './common-dist', to: 'reactapp'},
            {from: './src/globalStyles/prefixed-bootstrap.min.css', to: 'reactapp/prefixed-bootstrap.min.css'},
        ]),
        new ExtractTextPlugin({
            filename:'reactapp/styles.css',
            allChunks: true
        })
    ],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "babel-loader"
                    },
                    {
                        loader: "ts-loader",
                        options:{
                            transpileOnly: true
                        }
                    }
                ]
            },
            {
                test: /\.(js|jsx|babel)$/,
                use: [{
                    loader: "babel-loader"
                }],
                exclude: /node_modules/,
            },
            {
                test: /\.otf(\?\S*)?$/,
                use: [{
                    loader: `url-loader`,
                    options: {
                        name:fontPath,
                        limit:10000
                    }
                }]
            },
            {
                test: /\.eot(\?\S*)?$/,
                use: [{
                    loader: `url-loader`,
                    options: {
                        name:fontPath,
                        limit: 10000
                    }
                }],
            },
            {
                test: /\.svg(\?\S*)?$/,
                use: [
                    {
                        loader: `url-loader`,
                        options: {
                            name:fontPath,
                            mimetype:'image/svg+xml',
                            limit:10000
                        }
                    }
                ],
            },
            {
                test: /\.ttf(\?\S*)?$/,
                use: [{
                    loader: `url-loader`,
                    options: {
                        name:fontPath,
                        mimetype:'application/octet-stream',
                        limit:10000
                    }
                }],
            },
            {
                test: /\.woff2?(\?\S*)?$/,
                use: [{
                    loader: `url-loader`,
                    options: {
                        name:fontPath,
                        mimetype:'application/font-woff',
                        limit:10000
                    }
                }],
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                use: [{
                    loader: `url-loader`,
                    options:{
                        name:imgPath,
                        limit:10000
                    }
                }],
            },
            {
                test: /lodash/,
                use: [
                    {loader: 'imports-loader?define=>false'}
                    ]
            },
            {
                test: /\.js$/,
                enforce:"pre",
                use: [{
                    loader: "source-map-loader",
                }]
            },
            {
                test: /bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/,
                use: [{
                    loader:'imports-loader',
                    options:{
                        'jQuery':'jquery'
                    }
                }]
            },
            {
                test: /\.js$/,
                loader: 'ify-loader'
            }
        ]
    },
    devServer: {
        contentBase: './dist',
        hot: true,
        historyApiFallback:false,
        noInfo:false,
        quiet:false,
        lazy:false,
        publicPath:'/',
        https:false,
        host:'localhost',
        headers: {"Access-Control-Allow-Origin": "*"},
        stats:'errors-only'
    },


};

if (isDev || isTest) {

    config.devtool = 'source-map';

    config.module.rules.push(
        {
            test: /\.module\.scss$/,
            use:[
                'style-loader',
                {
                    loader:'css-loader',
                    options: {
                        modules:true,
                        importLoaders:2,
                        localIdentName:'[name]__[local]__[hash:base64:5]'
                    }
                },
                'sass-loader',
                sassResourcesLoader
            ]

        }
    );

    config.module.rules.push(
        {
            test: /\.css$/,
            use: ['style-loader','css-loader']
        }
    );

    config.module.rules.push(
        {
            test: /\.scss$/,
            exclude: /\.module\.scss/,
            use:[
                'style-loader',
                'css-loader',
                'sass-loader',
                sassResourcesLoader
            ]
        }
    );

    config.devServer.port = devPort;
    //config.devServer.hostname = devHost;

    // force hot module reloader to hit absolute path so it can load
    // from dev server
    config.output.publicPath = '//localhost:4000/';

} else {

    config.devtool = 'cheap-module-source-map';

    config.module.rules.push(
        {
            test: /\.module\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback:'style-loader',
                use:[
                    {
                        loader: 'css-loader',
                        options:{
                            modules:true,
                            importLoaders:2,
                            localIdentName:'[name]__[local]__[hash:base64:5]'
                        }
                    },
                    'sass-loader',
                    sassResourcesLoader
                ]
            })
        }
    );

    config.module.rules.push(
        {
            test: /\.scss$/,
            exclude: /\.module\.scss/,
            use: ExtractTextPlugin.extract({
                fallback:'style-loader',
                use:[
                    'css-loader',
                    'sass-loader',
                    sassResourcesLoader
                ]
            })
        }
    );

    config.module.rules.push(
        {
            test: /\.css/,
            loader: ExtractTextPlugin.extract({
                fallback:'style-loader',
                use:'css-loader'
            })
        }
    );

    config.plugins.push(
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': `"${process.env.NODE_ENV || 'production'}"`
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: true,
            comments: false
        })
    );
}

module.exports = config;
