import post from './apiConfig'
export default {
  // AI接口
  /**
   * 专辑信息
   * @param  { String } file               图片文件
   * @param  { String } purpose            传图用途 item:灵感辑上传（默认）    */
  aiCategory (params) {
    return post('ai/ai/category', params)
  },
  aiSearch (params) {
    return post('ai/ai/search', params)
  },
  aiDetect (params) {
    return post('ai/ai/detect', params)
  }
}
