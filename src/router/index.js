import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import('../components/Login.vue')
const Home = () => import('../components/Home.vue')
const Welcome = () => import('../components/Welcome')
const Users = () => import('../components/Users/Users.vue')
const Roles = () => import('../components/Rights/Roles.vue')
const Rights = () => import('../components/Rights/Rights.vue')
const Goods = () => import('../components/Goods/Goods.vue')
const Params = () => import('../components/Goods/Params.vue')
const Add = () => import('../components/Goods/Add.vue')
const Categories = () => import('../components/Goods/Categories.vue')
const Orders = () => import('../components/Orders/Orders.vue')
const Reports = () => import('../components/Reports/Reports.vue')

Vue.use(VueRouter)

const routes = [
  { path: '', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', redirect: '/home/welcome' },
  {
    path: '/home',
    component: Home,
    children: [
      { path: '/home/welcome', component: Welcome },
      { path: '/home/users', component: Users },
      { path: '/home/roles', component: Roles },
      { path: '/home/rights', component: Rights },
      { path: '/home/goods', component: Goods },
      { path: '/home/params', component: Params },
      { path: '/goods/add', component: Add },
      { path: '/home/categories', component: Categories },
      { path: '/home/orders', component: Orders },
      { path: '/home/reports', component: Reports }
    ]
  }
]

const router = new VueRouter({
  routes
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

export default router
