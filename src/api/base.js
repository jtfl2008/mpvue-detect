import post from './apiConfig'
export default {
  // 公用接口
  /**
   * 专辑信息
   * @param  { String } file               图片文件
   * @param  { String } purpose            传图用途 item:灵感辑上传（默认） detect_product:拍照识家具 search_photo:拍照找图片
   */
  uploadPicture ({ file, purpose = 'item' } = {}) {
    return post('base/image/uploadPicture', {
      file: file,
      purpose: purpose
    })
  }
}
