import Vue from 'vue'
import App from './App'
import MpvueRouterPatch from 'mpvue-router-patch'
import store from './store/index'
import Api from './api/index'
import wxApi from './utils/wxApiPromisify'
import './assets/css/rest.css'
import './assets/css/weui.css'
Vue.config.productionTip = false
App.mpType = 'app'
Vue.prototype.$store = store
// 请求接口
Vue.prototype.$api = Api
// 微信接口
Vue.prototype.$wxApi = wxApi
Vue.use(MpvueRouterPatch)
const app = new Vue(App)
app.$mount()
