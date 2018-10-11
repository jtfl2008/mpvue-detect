import Config from '../config/index'
const md5 = require('./md5.js')
function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

export function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('/')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}
// 生成uuid
export const generateUUID = () => {
  let d = new Date().getTime()
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (
    c
  ) {
    let r = ((d + Math.random() * 16) % 16) | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

// 生成md5签名
export const generateMD5 = params => {
  let sortArr = Object.keys(params).sort((a, b) => {
    return a.localeCompare(b)
  })
  let paramsSort = {}
  for (let i = 0, len = sortArr.length; i < len; i++) {
    paramsSort[sortArr[i]] = params[sortArr[i]]
  }
  // 参数里有sign的先删除sign
  delete paramsSort.sign
  let signstr = ''
  for (let i in paramsSort) {
    signstr += i + paramsSort[i]
  }
  let sign = md5.md5(md5.md5(signstr) + Config.app_secret)
  return sign
}

/* export const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj = {
        success: res => {
          resolve(res)
        },
        fail: err => {
          reject(err)
        }
      }
      fn()
    })
  }
} */
// 微信api转promise
/* export const wxPromisify = fn => {
  return new Promise((resolve, reject) => {
    fn({
      success: res => {
        resolve(res)
      },
      fail: err => {
        reject(err)
      }
    })
  })
} */
export const wxPromisify = api => {
  return (options, ...parmas) => {
    return new Promise((resolve, reject) => {
      api(
        Object.assign({}, options, { success: resolve, fail: reject }),
        ...parmas
      )
    })
  }
}
export default {
  formatNumber,
  formatTime,
  generateUUID,
  generateMD5,
  wxPromisify
}
