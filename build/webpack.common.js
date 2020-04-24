const path = require("path");
const fs = require("fs");

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// 压缩 js
const TerserPlugin = require("terser-webpack-plugin");
// 压缩 css，webpack v5 开始使用 optimization.minimizer 配置项
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const rules = require("./webpack.rules.conf"); // 导入 loader 配置
const utils = require("./utils"); // 导入工具方法

const devMode = process.env.NODE_ENV !== "production"; // 记录 mode
const pwd = process.cwd();
// 是否使用CDN, 可使用cross-env 设置此变量启用CDN
const CDN = process.env.CDN ? process.env.CDN : false;

// 获取 externals 扩展配置
const externals =
  CDN && !devMode ? utils.getExternals(utils.externalConfig) : {};
const externalConfig = CDN && !devMode ? utils.externalConfig : [];
// 提取 vendor 配置
const vendorKeys = Object.keys(utils.vendors);
const vendors =
  vendorKeys.length > 0 && !devMode
    ? vendorKeys.map((item) => `./dll/${item}.dll.js`)
    : [];

let common = {
  context: pwd,
  entry: {
    index: "./src/index.js",
    // index2: "./src/index2.js",
  },
  output: {
    filename: "js/[name].[hash:8].bundle.js",
    chunkFilename: "js/[id].[chunkhash:8].chunk.js",
    path: path.resolve(pwd, "./dist"),
    hotUpdateChunkFilename: "[id].[hash:8].hot-update.js",
  },
  module: {
    rules: rules,
  },
  resolve: {
    alias: {
      "@": path.resolve(pwd, "./src"),
    },
  },
  externals: externals,
  plugins: [new CleanWebpackPlugin(), new webpack.ProgressPlugin()],
  optimization: {
    splitChunks: {
      chunks: "all",
      name: "chunk-vendor",
      cacheGroups: {
        vendor: {
          name: "vendor", // 分离包的名字
          test: /[\\/]node_modules[\\/]/, //打包第三方库
          chunks: "all",
          priority: 10, // 优先级
        },
        common: {
          // 打包其余的的公共代码
          // test: /[\\/]src[\\/]utils[\\/]/,
          name: "common", // 分离包的名字
          minChunks: 2, // 引入两次及以上被打包
          chunks: "all",
          priority: 5,
        },
      },
    },
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
};

// 使用模板
try {
  let files = fs.readdirSync(path.resolve(pwd, "./public/template")); // {withFileTypes: true} 返回 Dirent 类实例
  files = files.map((item) => item.split(".")[0]);
  let keys = [];
  if (Object.prototype.toString.call(common.entry) === "[object Object]") {
    keys = Object.keys(common.entry);
  } else {
    mixGenerateTpl("index", "index", { title: "hello index" });
  }
  for (let i = 0; i < keys.length; i++) {
    let excludeChunks = keys.filter((item) => item !== keys[i]);
    if (files.includes(keys[i])) {
      mixGenerateTpl(keys[i], keys[i], {
        title: "hello " + keys[i],
        excludeChunks,
      });
    } else {
      mixGenerateTpl("index", keys[i], {
        title: "hello " + keys[i],
        excludeChunks,
      });
    }
  }
} catch (error) {
  console.log(
    "<=== webpack.common.js ===> 没有匹配到指定模板文件,将使用内置默认模板..."
  );
  mixGenerateTpl("", "", { title: "hello App" });
}
/**
 * @method mixGenerateTpl 添加 HtmlWebpackPlugin 模板参数
 * @param {String} template 模板文件名称
 * @param {String} filename 打包后文件名称
 * @param {Object} rest 其他配置参数
 */
function mixGenerateTpl(template, filename, ...rest) {
  let config = {
    title: "hello webpack",
    scriptLoading: "defer",
    cdnConfig: externalConfig,
    vendor: vendors,
    ...rest[0],
  };
  if (template) {
    config.template = path.resolve(pwd, `./public/template/${template}.html`);
  }
  if (filename) {
    config.filename = path.resolve(pwd, `./dist/${filename}.html`);
  }
  common.plugins.push(new HtmlWebpackPlugin(config));
}

// 生产环境 启用copy-webpack-plugin
!devMode &&
  common.plugins.push(
    new CopyWebpackPlugin([
      { from: path.resolve(pwd, "./public/dll"), to: "./dll" },
    ])
  );

module.exports = common;
