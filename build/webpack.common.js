const path = require("path");
const fs = require("fs");

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const CopyWebpackPlugin = require("copy-webpack-plugin");

const rules = require("./webpack.rules.conf"); // 导入 loader 配置
const utils = require("./utils"); // 导入工具方法
const vendorsConf = require("../config/vendors.conf.json");
const externalsConf = require("../config/externals.conf.json");

const devMode = process.env.NODE_ENV !== "production"; // 记录 mode
const PWD = process.cwd();
// 是否使用 CDN, 可使用 cross-env 设置此变量启用CDN
const CDN = process.env.CDN === "true" ? true : false;
let cdnList = [],
  externalsKeys = {},
  vendors = [];
if (!devMode) {
  if (CDN) {
    cdnList = utils.generateCdnExternals(externalsConf.list) || []; // 获取 externals 扩展配置
    for (let i = 0, len = cdnList.length; i < len; i++) {
      externalsKeys[cdnList[i].name] = cdnList[i].scope;
    }
  } else {
    // 提取 vendor 配置
    const vendorKeys = Object.keys(vendorsConf);
    vendors =
      vendorKeys.length > 0
        ? vendorKeys.map((item) => `./dll/${item}.dll.js`)
        : [];
  }
}
// 公共配置项
let common = {
  context: PWD,
  entry: {
    index: "./src/index.js",
    // index2: "./src/index2.js",
  },
  output: {
    filename: "js/[name].[hash:8].bundle.js",
    chunkFilename: "js/[id].[chunkhash:8].chunk.js",
    path: path.resolve(PWD, "./dist"),
    hotUpdateChunkFilename: "[id].[hash:8].hot-update.js",
  },
  module: {
    rules: rules,
  },
  resolve: {
    alias: {
      "@": path.resolve(PWD, "./src"),
    },
  },
  externals: externalsKeys,
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
    // runtimeChunk: {
    //   name: 'runtime' // 创建一个在所有生成 chunk 之间共享的运行时文件
    // }
  },
};

// 使用模板
try {
  let files = fs.readdirSync(path.resolve(PWD, "./public/template")); // {withFileTypes: true} 返回 Dirent 类实例
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
    cdnConfig: cdnList,
    vendor: vendors,
    ...rest[0],
  };
  if (template) {
    config.template = path.resolve(PWD, `./public/template/${template}.html`);
  }
  if (filename) {
    config.filename = path.resolve(PWD, `./dist/${filename}.html`);
  }
  common.plugins.push(new HtmlWebpackPlugin(config));
}

// 生产环境 启用 copy-webpack-plugin
!devMode &&
  common.plugins.push(
    new CopyWebpackPlugin([
      { from: path.resolve(PWD, "./public/dll"), to: "./dll" },
    ])
  );

module.exports = common;
