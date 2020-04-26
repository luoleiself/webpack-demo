//  抽离 css 插件, webpack v4开始代替 ExtractTextWebpackPlugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devMode = process.env.NODE_ENV !== "production";

let rules = [
  {
    test: /\.(sa|sc|c)ss$/i,
    use: [
      devMode
        ? "style-loader"
        : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // 解决打包后css文件与html文件非同目录下css中引用图片的路径问题
              publicPath: "../",
            },
          },
      "css-loader",
      "postcss-loader",
      {
        loader: "postcss-loader",
        options: {
          sourceMap: true,
          config: {
            path: "postcss.config.js", // 这个得在项目根目录创建此文件
          },
        },
      },
      "sass-loader",
    ],
  },
  {
    test: /\.(png|jpe?g|bmp|gif)$/i,
    use: [
      {
        loader: "url-loader",
        options: {
          limit: 8192,
          outputPath: "./images",
          name: "[hash:12].[ext]",
        },
      },
    ],
  },
  {
    test: /\.js$/i,
    exclude: /node_modules/,
    use: ["babel-loader"],
  },
  {
    test: /\.(eot|svg|ttf|woff|woff2)$/i,
    use: [
      {
        loader: "file-loader",
        options: {
          outputPath: "fonts/",
          name: "[hash:12].[ext]",
        },
      },
    ],
  },
  { test: /\.xml$/i, use: ["xml-loader"] },
];

module.exports = rules;
