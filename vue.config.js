module.exports = {
  // 选项....
  //  自定义打包入口
  chainWebpack: config => {
    config.when(process.env.NODE_ENV === 'production', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main.js')
    })
    config.set('externals', {
      vue: 'Vue',
      axios: 'axios',
      'vue-router': 'VueRouter',
      lodash: '_',
      echarts: 'echarts',
      nprogress: 'NProgress',
      'vue-quill-editor': 'VueQuillEditor'
    })
  }
}
