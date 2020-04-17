const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common');

// const DashboardPlugin = require('webpack-dashboard/plugin'); // webpack-dev-server 强化插件，美化控制台输出信息
module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    // new DashboardPlugin(),  // webpack-dev-server 强化插件，美化控制台输出信息
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin() // 显示模块的相对路径
  ],
  devServer: {
    contentBase: path.resolve(__dirname, '../dist'),
    compress: true,
    hot: true,
    overlay: true,
    host: 'localhost',
    port: 8080
  }
})
