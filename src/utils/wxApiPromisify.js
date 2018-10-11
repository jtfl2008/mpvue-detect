import Config from '../config/'
import { wxPromisify, generateUUID, generateMD5 } from './index.js'
import store from '../store'
export const wxGetImageInfo = () => {
  return wxPromisify(wx.getImageInfo)
}
export const wxChooseImage = ({
  sizeType = ['original', 'compressed'],
  sourceType = ['album', 'camera'],
  count = 9
} = {}) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: count,
      sizeType: sizeType,
      sourceType: sourceType,
      success: res => {
        resolve(res.tempFilePaths)
      },
      fail: err => {
        reject(err)
      }
    })
  })
}
export const uploadImage = ({
  files = [],
  name = 'file',
  formData = {},
  header = {
    'X-Auth-Token': store.state.auth_token,
    'X-App-Version': Config.appVersion,
    'X-Platform': Config.platform,
    'Content-Type': 'multipart/form-data'
  },
  url = Config.apiBaseURL
}) => {
  return new Promise((resolve, reject) => {
    if (files && files.length > 0) {
      var promiseList = []
      for (var i = 0; i < files.length; i++) {
        promiseList[i] = new Promise((resolve, reject) => {
          formData.app_key = Config.protocolParams.app_key
          formData.t = Date.now() + ''
          formData.uuid = generateUUID()
          formData.sign = generateMD5(formData)
          wx.uploadFile({
            url: url + 'base/image/uploadPicture',
            filePath: files[i],
            name: name,
            formData: formData,
            header: header,
            success: res => {
              resolve(res.data)
            },
            fail: err => {
              reject(err)
            }
          })
        })
      }
      Promise.all(promiseList)
        .then(res => {
          resolve(res)
        })
        .then(err => {
          reject(err)
        })
    }
  })
}
export default {
  wxChooseImage,
  uploadImage
}
