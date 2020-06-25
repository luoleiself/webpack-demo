const path = require('path');
const fs = require('fs');

const webpack = require('webpack');

const vendors = require('../config/vendors.conf.json');
const pwd = process.cwd();

delFiles(path.resolve(pwd, './public/dll'));
/**
 * @delFiles 删除文件
 * @param {String} dir 目录名
 */
function delFiles(dir) {
  // fs.rmdir({recursive: true}) // 递归删除目录，目前在实验阶段12.16.0
  // fs.unlink() // 删除文件，可以用
  try {
    const files = fs.readdirSync(dir); // {withFileTypes: true} 返回 Dirent 类实例
    for (let i = 0, len = files.length; i < len; i++) {
      fs.unlinkSync(path.resolve(dir, files[i]))
    }
  } catch (error) {
    console.log('<=== webpack.dll.js ===> 没有匹配到dll相关信息...');
  }
}

module.exports = {
  mode: 'production',
  entry: vendors,
  output: {
    path: path.resolve(pwd, './public/dll'),
    filename: '[name].dll.js',
    library: "[name]"
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(pwd, "./public/dll/[name]-manifest.json"),
      name: "[name]"
    })
  ]
}
