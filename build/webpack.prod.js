const path = require("path");
const fs = require("fs");

const webpack = require("webpack");
const merge = require("webpack-merge");
const common = require("./webpack.common");

// 压缩 js
const TerserPlugin = require("terser-webpack-plugin");
// 压缩 css，webpack v5 开始使用 optimization.minimizer 配置项
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
//  抽离 css 插件, webpack v4开始代替 ExtractTextWebpackPlugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 开启gzip压缩
const CompressWebpaclPlugin = require("compression-webpack-plugin");
// 导入打包分析工具
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const pwd = process.cwd();

let prod = {
  mode: "production",
  devtool: "source-map",
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        extractComments: false, // 是否抽离 vendor 文件中的 license 注释并输出到 [vendor].LICENSE.txt
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    // runtimeChunk: {
    //   name: 'runtime' // 创建一个在所有生成 chunk 之间共享的运行时文件
    // }
  },
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
    // 默认开启 gzip 压缩
    new CompressWebpaclPlugin({
      test: /\.(j|cs)s$/i,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
};

// 使用打包分析工具
if (process.env.ANALYZE === "true") {
  prod.plugins.push(new BundleAnalyzerPlugin());
}

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
