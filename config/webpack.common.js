var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var helpers = require('./helpers');

module.exports = {
  entry: {
    'index': './src/Index.ts'
  },

  resolve: {
    extensions: ['.js', '.ts']
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loaders: ['awesome-typescript-loader', 'cmpx-mvc-loader']
      }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['index']
    }),

    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject:true
    })
  ]
};