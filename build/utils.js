const externalsConf = require("../config/externals.conf.json");

/**
 * @method getModulesVersion 获取依赖模块版本号
 * @returns {Object} mvs 版本号
 */
exports.getModulesVersion = () => {
  let mvs = {};
  let regexp = /^npm_package_.{0,3}dependencies_/gi;
  for (let m in process.env) {
    if (regexp.test(m)) {
      mvs[m.replace(regexp, "").replace(/_/g, "-")] = process.env[m].replace(
        /(~|\^)/g,
        ""
      );
    }
  }
  return mvs;
};

/**
 * @method generateCdnExternals 生成资源CDN链接
 * @param {Array} conf externals List
 * @returns {Array} externals
 * ```javascript
 *  [{
 *    name: 'element-ui',
 *    scope: 'ELEMENT',
 *    css: 'https://cdn.bootcdn.net/ajax/libs/element-ui/2.13.2/theme-chalk/index.css',
 *    js: 'https://cdn.bootcdn.net/ajax/libs/element-ui/2.13.2/index.js',
 *  }]
 * ```
 */
exports.generateCdnExternals = (conf) => {
  let moduleVerison = this.getModulesVersion(); // 获取所有依赖模块和版本号
  conf = conf || externalsConf.list; // 默认使用 externalsConfig 配置
  conf.forEach((item) => {
    // 遍历配置
    if (item.name in moduleVerison) {
      let version = moduleVerison[item.name];
      if (item.hasOwnProperty("css") && !item.css.includes("//")) {
        item.css = [
          externalsConf.cdnBaseUrl,
          item.name,
          version,
          item.css,
        ].join("/");
      }
      if (item.hasOwnProperty("js") && !item.js.includes("//")) {
        item.js = [externalsConf.cdnBaseUrl, item.name, version, item.js].join(
          "/"
        );
      }
    } else {
      throw new Error(
        "相关依赖未安装，请先执行npm i %s 安装相关依赖",
        item.name
      );
    }
  });
  return conf;
};
