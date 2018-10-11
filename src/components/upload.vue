<template>
  <div class="weui-uploader">
    <div class="weui-uploader__bd">
      <div class="weui-uploader__files" id="uploaderFiles">
        <block v-for="item in files" :key="index">
          <div class="weui-uploader__file" @click="predivImage" :id="item">
            <image class="weui-uploader__img" :src="item" mode="aspectFill" />
          </div>
        </block>
      </div>
      <div class="weui-uploader__input-box">
        <div class="weui-uploader__input" @click="chooseImage"></div>
      </div>
    </div>
  </div>
</template>
<script>
  // import { wxChooseImage } from '../utils/wxApiPromisify'
  export default {
    data () {
      return {
        files: []
      }
    },
    methods: {
      chooseImage1 (e) {
        var _this = this
        wx.chooseImage({
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            _this.files = _this.files.concat(res.tempFilePaths)
            console.log(_this.files)
          },
          fail: function () {
            console.log('fail')
          },
          complete: function () {
            console.log('commplete')
          }
        })
      },
      chooseImage (e) {
        // console.log(wxPromisify(wx.chooseImage))
        this.$wxApi.wxChooseImage().then((res) => {
          // this.files = this.files.concat(res.tempFilePaths)
          console.log(res)
        })
        // this.chooseImageP().then((res) => {
        //   this.files = this.files.concat(res.tempFilePaths)
        //   console.log(res)
        // })
      },
      predivImage (e) {
        wx.previewImage({
          current: e.currentTarget.id, // 当前显示图片的http链接
          urls: this.files // 需要预览的图片http链接列表
        })
      }
    }
  }
</script>
<style>
  .weui-uploader{
    width: 200px;
    height: 50px;
  }
</style>
