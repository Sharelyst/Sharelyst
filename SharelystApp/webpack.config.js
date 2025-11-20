const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!react-native|@react-native)/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/BatchedBridge/NativeModules': path.resolve(__dirname, 'node_modules/react-native-web/dist/index.js'),
      'react-native/Libraries/TurboModule/TurboModuleRegistry': path.resolve(__dirname, 'node_modules/react-native-web/dist/index.js'),
    },
    extensions: ['.web.js', '.js', '.web.ts', '.ts', '.web.tsx', '.tsx', '.json'],
    fallback: {
      "crypto": false,
      "stream": false,
      "buffer": false,
      "util": false,
      "path": false,
      "fs": false,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(true),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      global: 'globalThis',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    hot: true,
  },
};
