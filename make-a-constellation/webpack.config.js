const path = require('path');
const webpack = require('webpack')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './'),
  },
  mode: 'development',
  resolve: {fallback: {"util": require.resolve("util/"), "buffer": require.resolve("buffer")}},
  plugins: [
    // fix "process is not defined" error:
    // (do "npm install process" before running the build)
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, './'),
    },
    compress: true,
    port: 3000,
    hot: true
  },
};