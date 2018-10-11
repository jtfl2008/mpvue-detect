import post from './apiConfig'
export default {
  /**
   * 专辑信息
   * @param  { String } code               小程序临时登录凭证code
   * @param  { String } encrypted_data     小程序按钮携带的encryptedData
   * @param  { String } iv                 小程序按钮携带的iv
   */
  authorization ({ code, encryptedData, iv } = {}) {
    return post('miniapp/user/login', {
      code: code,
      encrypted_data: encryptedData,
      iv: iv,
      extend: '1111'
    })
  }
}
