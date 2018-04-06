var HtmlWebpackPlugin = require('html-webpack-plugin');

var webpack = require('webpack');
const dotenv   = require('dotenv');
const path     = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

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
       'bootstrap-loader',
        `./src/router.jsx`
       
    ],
    'output': {
        path: path.resolve(__dirname, 'dist'),
        filename: "bundle.js"
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
    
            },
            {
                test: /\.css$/,
                use: ['style-loader','css-loader']
            },

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
        stats:'errors-only',
        port: devPort
    },


};

module.exports = config;
