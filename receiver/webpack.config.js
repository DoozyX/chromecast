const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const getPackageJson = require('./scripts/getPackageJson');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const { version, name, license, repository, author } = getPackageJson(
  'version',
  'name',
  'license',
  'repository',
  'author'
);

const banner = `
  ${name} v${version}
  ${repository.url}
  Copyright (c) ${author.replace(/ *<[^)]*> */g, ' ')} and project contributors.
  This source code is licensed under the ${license} license found in the
  LICENSE file in the root directory of this source tree.
`;

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    'smart-web-player': './src/lib/index.ts',
    'smart-web-player.tizen': './src/lib/index-tizen.ts',
    'smart-web-player.html': './src/lib/index-html.ts',
    'smart-web-player.video-js': './src/lib/index-video-js.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    library: 'SmartWebPlayer',
    libraryTarget: 'umd',
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({ extractComments: false }),
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [
      {
        test: /\.([mjt])s$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: true } },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/index.css',
    }),
    new webpack.BannerPlugin(banner),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
  },
  externals: {
    'shaka-player': 'shaka',
  },
};
