const path = require("path");
const fs = require("fs");

const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common");

//  抽离 css 插件, webpack v4开始代替 ExtractTextWebpackPlugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 开启gzip压缩
const CompressWebpaclPlugin = require("compression-webpack-plugin");

const pwd = process.cwd();

let prod = {
  mode: "production",
  devtool: "source-map",
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/[name].[hash:8].min.css",
      chunkFilename: "./css/[name].[hash:8].chunk.css",
    }),
    new webpack.HashedModuleIdsPlugin(), // 消除构建后vendor文件hash值变化
    // 合并小的 chunk 文件
    new webpack.optimize.LimitChunkCountPlugin({
      minChunkSize: 30000,
    }),
    new CompressWebpaclPlugin({
      test: /\.(j|cs)s$/i,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
};

// dll 优化
try {
  let files = fs.readdirSync(path.resolve(pwd, "./public/dll"));
  for (let i = 0, len = files.length; i < len; i++) {
    if (/.*manifest\.json$/i.test(files[i])) {
      prod.plugins.push(
        new webpack.DllReferencePlugin({
          context: pwd,
          manifest: require(path.resolve(pwd, `./public/dll/${files[i]}`)),
        })
      );
    }
  }
} catch (error) {
  console.log("<=== webpack.prod.js ===> 没有匹配到dll相关信息...");
}

module.exports = merge(common, prod);
