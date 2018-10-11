import post from './apiConfig'
export default {
  // 商品接口
  /**
   * 专辑信息
   * @param  { String } file               图片文件
   * @param  { String } purpose            传图用途 item:灵感辑上传（默认）    */
  productInfo (params) {
    return post('product/product/info', params)
  }
}
