/* dll 打包配置项 */
exports.vendors = {
  vue: ['vue', 'vue-router', 'axios'],
  react: ['react', 'react-dom'],
  common: ['jquery', 'lodash']
}

/* cdn 资源基础域名 */
exports.cdnBaseUrl = 'https://cdn.bootcss.com';

/* externals 外部扩展配置 */
exports.externalConfig = [
  // { name: 'vue', scope: 'Vue', js: 'vue.min.js' },
  // { name: 'vue-router', scope: 'VueRouter', js: 'vue-router.min.js' },
  // { name: 'axios', scope: 'axios', js: 'axios.min.js' },
  // { name: 'element-ui', scope: 'ELEMENT', js: 'index.js', css: 'theme-chalk/index.css' },
  // { name: 'react', scope: 'React', js: 'umd/react.production.min.js' },
  // { name: 'jquery', scope: 'jQuery', js: 'jquery.min.js' }
]

/**
 * @method getModulesVersion 获取依赖模块版本号
 * @returns {Object} mvs 版本号
 */
exports.getModulesVersion = () => {
  let mvs = {};
  let regexp = /^npm_package_.{0,3}dependencies_/gi;
  for (let m in process.env) {
    if (regexp.test(m)) {
      mvs[m.replace(regexp, '').replace(/_/g, '-')] = process.env[m].replace(/(~|\^)/g, '');
    }
  }
  return mvs;
};

/**
 * @method getExternals 获取外部扩展不需要打包的模块
 * @param {Array} conf cdn配置项
 * @returns {Object} externals
 */
exports.getExternals = conf => {
  let externals = {};
  let moduleVerison = this.getModulesVersion(); // 获取所有依赖模块和版本号
  conf = conf || this.externalConfig; // 默认使用 externalsConfig 配置
  conf.forEach(item => { // 遍历配置
    if (item.name in moduleVerison) {
      let version = moduleVerison[item.name];
      if (item.hasOwnProperty('css') && !item.css.includes('//')) {
        item.css = [this.cdnBaseUrl, item.name, version, item.css].join('/');
      }
      if (item.hasOwnProperty('js') && !item.js.includes('//')) {
        item.js = [this.cdnBaseUrl, item.name, version, item.js].join('/');
      }
      externals[item.name] = item.scope; // 为打包时准备
    } else {
      throw new Error('相关依赖未安装，请先执行npm i %s 安装相关依赖', item.name);
    }
  });
  return externals;
}
