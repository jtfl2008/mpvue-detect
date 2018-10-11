import Config from '../config'
import { generateUUID, generateMD5 } from '../utils/index'
import store from '../store'
// import qs from 'qs'
const Fly = require('flyio/dist/npm/wx')
const fly = new Fly()
// 设置请求基地址
fly.config.baseURL = Config.apiBaseURL
// fly.config.timeout = 10 * 1000
fly.interceptors.request.use(request => {
  wx.showToast({
    title: '客官，请稍后...',
    icon: 'loading',
    mask: true
  })
  // 给所有请求添加自定义header，带上token信息让服务器验证用户登陆
  if (store.state.auth_token) {
    request.headers['X-Auth-Token'] = store.state.auth_token
  }
  request.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  request.headers['X-App-Version'] = Config.appVersion
  request.headers['X-Platform'] = Config.platform

  var signParams = {}
  signParams.app_key = Config.protocolParams.app_key
  signParams.t = Date.now() + ''
  signParams.uuid = generateUUID()
  signParams.sign = generateMD5(Object.assign(signParams, request.body))
  Object.assign(request.body, signParams)
  // console.log('flyio发送请求,request为', request)
  return request
})

fly.interceptors.response.use(
  response => {
    // console.log('flyio响应,response为', response)
    if (response.data.error_code === 0) {
      wx.hideToast()
      return response.data
    } else if (response.data.error_code === -201) {
      wx.hideToast()
      wx.showModal({
        title: '授权提示',
        content: '小程序需要您的微信授权才能使用哦'
      })
    } else {
      wx.showToast({
        title: response.data.error_msg,
        icon: 'none'
      })
    }
  },
  err => {
    wx.showToast({
      title: err.message,
      icon: 'none'
    })
  }
)
// 发送请求
export default function post (url, params) {
  return new Promise((resolve, reject) => {
    fly
      .post(url, params)
      .then(
        res => {
          resolve(res.data)
        },
        err => {
          reject(err.data)
        }
      )
      .catch(err => {
        reject(err)
      })
  })
}
