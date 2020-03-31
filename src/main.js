import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
// 导入全局样式
import './assets/css/reset.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.bubble.css'
// ajax模块
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import NProgress from 'nprogress'
Vue.component('tree-table', TreeTable)
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios
// 注册富文本编辑器
Vue.use(VueQuillEditor)
// 注册全局过滤器
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 路由导航
router.beforeEach((to, from, next) => {
  // 如果是访问登陆页面，直接放行
  if (to.path === '/login') return next()
  // 判断是否登录
  const tokenStr = window.sessionStorage.getItem('token')
  // 没登录，不放行
  if (!tokenStr) return next('/login')
  // 登录，放行
  next()
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
