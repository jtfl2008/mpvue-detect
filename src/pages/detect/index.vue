<template>
  <div class="distinguish">
    <view class="index-body">
      <image class="bg-index"
             mode="widthFix"
             src="/static/images/index-bg.jpg" />
      <!-- 关注按钮 -->
      <view class="follow-wx-box"
            @click="toogleDialog">
        <image class="follow-icon"
               src="/static/images/follow-wx.png" />
        <text class="follow-text">关注公众号</text>
      </view>
      <!-- 模态框 -->
      <view class="jt-modal"
            v-show="isShowModal">
        <view class="md-dialog">
          <view class="tips-info">
            <text class="tips-content">复制公众号idcoolchina，或搜索</text>
            <text class="tips-content tips-p1">家图互动加关注，家图AI找家具不迷路！</text>
          </view>
          <view class="dlg-btn-box">
            <text class="btn-cancel"
                  @click="toogleDialog">取消</text>
            <text class="btn-confirm"
                  @click="confirmCopy">复制</text>
          </view>
        </view>
      </view>
      <view class="power-by">
        <image class='power-by-img'
               src='/static/images/malonglogo.png' />
      </view>
      <view class="actions">
        <view class="item-action">
          <image class="img-action"
                 @click="takePicture"
                 mode="aspectFit"
                 src="/static/images/xiangji.png" />
          <text class="photograph">拍 照</text>
        </view>
        <view class="item-action">
          <image class="img-action"
                 @click="selectPicture"
                 mode="aspectFit"
                 src="/static/images/xiangce.png" />
          <text class="photograph">相 册</text>
        </view>
      </view>
    </view>
    <tab-bar @change="tabBarChange"
             :config="tabBarConfig"></tab-bar>
  </div>
</template>
<script>
  import { mapState } from 'vuex'
  import TabBar from '@/components/TabBar'
  export default {
    data () {
      return {
        isShowModal: false,
        tabBarConfig: {
          selectedTabBarIndex: this.selectedTabBarIndex,
          selectedTabBarPath: this.selectedTabBarPath
        }
      }
    },
    components: {
      'tab-bar': TabBar
    },
    computed: {
      ...mapState(['selectedTabBarIndex', 'selectedTabBarPath', 'auth_token'])
    },
    mounted () {

    },
    onShareAppMessage: function (res) {
      return {
        title: '我在用家图AI识图找家具，快跟上节奏！',
        path: '/pages/index/index',
        success: function (res) {
          // 转发成功
          console.log('转发成功')
        },
        fail: function (res) {
          // 转发失败
          console.log('转发失败')
        }
      }
    },
    methods: {
      pickImage (pickFrom) {
        console.log(pickFrom)
        let sourceType = []
        sourceType.push(pickFrom)
        this.$store.commit('setImgSourceType', pickFrom === 'camera' ? 1 : 2)
        wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['compressed'], // 指定压缩图
          sourceType: sourceType, // 可以指定来源是相册还是相机，默认二者都有
          success: res => {
            let tempFilePaths = res.tempFilePaths
            this.$store.commit('setTempFilePath', tempFilePaths[0])
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/detect/detect'
              })
            }, 1000)
          },
          fail: err => {
            console.log(err)
          }
        })
      },
      toogleDialog () {
        this.isShowModal = !this.isShowModal
      },
      confirmCopy () {
        let that = this
        wx.setClipboardData({
          data: 'idcoolchina',
          success (res) {
            wx.getClipboardData({
              success (res) {
                // console.log(res.data)
              }
            })
            wx.showToast({
              title: '已复制',
              icon: 'success',
              duration: 2000,
              success () {
                that.isShowModal = false
              }
            })
          }
        })
      },
      selectPicture () {
        this.pickImage('album')
      },
      takePicture () {
        this.pickImage('camera')
      },
      tabBarChange (item, index) {
        this.$store.commit('setTabBar', { selectedTabBarIndex: index, selectedTabBarPath: item.pagePath })
      }
    }
  }
</script>
<style>
  .index-body {
    position: relative;
    height: 100%;
  }

  .bg-index {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: vh;
  }

  .actions {
    position: fixed;
    top: 930rpx;
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-around;
    box-sizing: border-box;
    padding: 0rpx 100rpx;
    width: 100%;
    height: 160rpx;
  }

  .item-action {
    position: relative;
    width: 104rpx;
    height: 168rpx;
  }
  .photograph {
    position: absolute;
    right: 7rpx;
    bottom: 0;
    color: #000;
    font-size: 39rpx;
  }

  .img-action {
    width: 98rpx;
    height: 98rpx;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-radius: 52rpx;
    background-color: rgba(255, 255, 255, 0.3);
  }

  .power-by {
    position: fixed;
    top: 850rpx;
    left: 130rpx;
  }

  .power-by-img {
    display: inline-block;
    width: 493rpx;
    height: 25rpx;
  }

  /*点关注按钮*/
  .follow-wx-box {
    position: fixed;
    top: 20rpx;
    right: 20rpx;
    z-index: 2;
    padding: 0 16rpx;
    height: 50rpx;
    border: 1px solid #e79056;
    border-radius: 30rpx;
    line-height: 50rpx;
  }
  .follow-icon {
    display: inline-block;
    margin-top: 9rpx;
    margin-right: 10rpx;
    width: 28rpx;
    height: 28rpx;
  }
  .follow-text {
    position: relative;
    top: -3rpx;
    color: #e79056;
    font-size: 24rpx;
  }

  /*确认模态框*/
  .jt-modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    height: vh;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .md-dialog {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    width: 602rpx;
    height: 338rpx;
    border-radius: 8rpx;
    background-color: #fff;
  }
  .tips-info {
    margin-top: 75rpx;
  }
  .tips-content {
    display: block;
    color: #262626;
    text-align: center;
    font-size: 28rpx;
  }
  .tips-p1 {
    margin-top: 10rpx;
  }
  .dlg-btn-box {
    margin: 65rpx auto 0;
    width: 480rpx;
  }
  .btn-cancel {
    display: inline-block;
    margin-right: 52rpx;
    width: 214rpx;
    height: 70rpx;
    border-radius: 8rpx;
    background-color: #e6e6e6;
    color: #262626;
    text-align: center;
    font-size: 26rpx;
    line-height: 70rpx;
  }
  .btn-confirm {
    display: inline-block;
    width: 214rpx;
    height: 70rpx;
    border-radius: 8rpx;
    background-color: #e79056;
    color: #fff;
    text-align: center;
    font-size: 26rpx;
    line-height: 70rpx;
  }
</style>
