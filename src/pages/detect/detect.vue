<template>
  <view>
    <!--待分析状态-->
    <view v-if="!detectedStatus"
          class="detect-loading">
      <view class="img-wrap">
        <image class="image-big"
               :src="tempFilePath"
               mode='aspectFill' />
      </view>

      <view class="big-mark"></view>

      <view class="loadding-wrap">
        <image class="img-loaddingDetect"
               src="/static/images/loadding-detect.gif"
               background-size="cover" />
        <text class="txt-uploaddingFile">{{tipsContent}}</text>
      </view>

      <image @tap="navToIndex"
             class="btn-cancelDetect"
             src="/static/images/cancel-detect.png"
             background-size="cover" />
    </view>
    <!--结果状态-->
    <div class="detect-result"
         v-if="detectedStatus">
      <div class="image-wrap"
           :class="[!goodsListIsTop ? 'show-imgwrap' : 'hide-imgwrap']">
        <scroll-view class="cropper_main_container">
          <view class="cropper_container">
            <canvas class="original_canvas"
                    canvas-id="originalCanvas"
                    :style="{width:cropperData.imageInfo.w+'px',height:cropperData.imageInfo.h+'px'}">
            </canvas>
            <movable-area class="cropper_canvas_container"
                          :style="{left:cropperData.left+'px',top:cropperData.top+'px',width:cropperData.width+'px',height:cropperData.height+'px'}">
              <canvas class="canvas"
                      canvas-id="canvas"
                      :style="{width:cropperData.width+'px',height:cropperData.height+'px'}"></canvas>
              <canvas class="move_canvas"
                      canvas-id="moveCanvas"
                      :style="{width:cropperData.width+'px',height:cropperData.height+'px'}"></canvas>

              <block v-if="cropperMovableItems">
                <block v-for="(item,index) in cropperMovableItems"
                       :key="index">
                  <movable-view class="move_item"
                                :style="{width:cropperData.itemLength+'px',height:cropperData.itemLength+'px'}"
                                direction="all"
                                :x="item.x - cropperData.itemLength/2"
                                :y="item.y - cropperData.itemLength/2"
                                @touchmove="moveEvent"
                                @touchend="endEvent"
                                :data-key="index"></movable-view>
                </block>
              </block>

              <movable-view class="move_all"
                            :style="{width:cropperCenterMoveArea.width+'px', height:cropperCenterMoveArea.height+'px'}"
                            direction="all"
                            :x="cropperCenterMoveArea.x"
                            :y="cropperCenterMoveArea.y"
                            @touchstart="allStartMoveEvent"
                            @touchmove="allMoveEvent"
                            @touchend="allEndMoveEvent"></movable-view>

            </movable-area>
          </view>
        </scroll-view>
      </div>
      <view v-if="categoryList.length>0"
            class="goods-list"
            :style="{top: listTop+'px'}">
        <view class="goods-category-box">
          <scroll-view class="goods-category"
                       scroll-x
                       :style="{width:categoryWidth+'rpx'}"
                       :scroll-into-view="'category-'+currentCategory">
            <view v-for="(item,index) in categoryList"
                  :id="'category-'+item.category_info.category_id"
                  @tap="changeCategory"
                  :data-categoryid="item.category_info.category_id"
                  :key="index"
                  class="category-item"
                  :class="{ current: item.category_info.category_id == currentCategory}">
              {{item.category_info.category_name}}
            </view>
          </scroll-view>

          <view class="top-down-box">
            <view class="bdr-left"></view>
            <view :hidden="goodsListIsTop"
                  class="btn-to-top"
                  @tap='switchGoodsListShow'></view>
            <view :hidden="!goodsListIsTop"
                  class="btn-to-down"
                  @tap='switchGoodsListShow'></view>
          </view>
        </view>

        <scroll-view class="goods-result"
                     upper-threshold="10"
                     @scrolltoupper="scrollIsToTop"
                     @scroll="goodsResultScroll"
                     :scroll-top="currentScrollTopVal"
                     :scroll-with-animation="true"
                     :scroll-y="true"
                     :style="{height: listHeight+'px'}">
          <view class="tips">
            <text>搜索结果不满意？求助大家帮忙</text>
            <button @tap="seekHelp"
                    class="button">求助</button>
          </view>
          <view v-for="(item,index) in goodsList"
                :key="index"
                class="goods-item"
                @tap="goGoodsPage(item)">
            <image class="goods-img"
                   :src="item.item_info.image.img0"
                   mode='aspectFill' />
            <view class="goods-title">{{item.item_info.title}}</view>
            <view class="goods-price">{{item.item_info.price}}</view>
          </view>
        </scroll-view>

      </view>
    </div>
  </view>
</template>
<script>
  import { mapState } from 'vuex'
  import { uploadImage } from '../../utils/wxApiPromisify'
  import { postType } from '@/utils/constant'
  // 获取显示区域长宽
  const device = wx.getSystemInfoSync()
  const W = device.windowWidth
  const H = 562 * W / 750
  const miniListHeight = device.windowHeight - (562 + 100) * W / 750
  const maxListHeight = device.windowHeight - (80 + 100) * W / 750

  let cropper = require('./welCropper.js')

  export default {
    data () {
      return {
        cropperData: {
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          itemLength: 0,
          imageInfo: {
            src: '',
            w: 0,
            h: 0
          },
          scaleInfo: {
            x: 1,
            y: 1
          }
        },
        cropperMovableItems: { // 框上的四个可移动的角的坐标
          topleft: {
            x: 50,
            y: 50
          },
          topright: {
            x: 0,
            y: 0
          },
          bottomleft: {
            x: 0,
            y: 0
          },
          bottomright: {
            x: 0,
            y: 0
          }
        },
        cropperCenterMoveArea: { // 框里整体可移动区域的左上角坐标、宽高、相对这次移动的上个点的坐标
          x: 50,
          y: 50,
          startX: 50,
          startY: 50,
          width: 100,
          height: 100
        },
        // 图片信息
        imgInfo: {
          imageId: '',
          imageSrc: '',
          tempFilePath: ''
        },
        // 框的信息
        frameInfo: {
          x: 0,
          y: 0,
          width: 1,
          height: 1
        },
        detectedStatus: false, // 识别状态，初始识别是否已经完成
        uploadedFileStatus: false, // 图片上传状态，是否已经上传完成
        categoryList: [], // 识别出的种类列表
        currentCategory: '', // 当前选中分类
        listTop: H,
        listHeight: miniListHeight,
        listScrollTop: 0,
        goodsListIsTop: false, // 商品列表是否置顶显示
        goodsList: [], // 当前选中分类下的商品列表
        scrollTopVal: 0, // 保存goods-result的scrolltop值
        currentScrollTopVal: 0,
        tipsContent: '',
        categoryWidth: (W - 60) * 2
      }
    },
    components: {
      // cropper: Cropper
    },
    computed: {
      ...mapState(['tempFilePath', 'imgSourceType'])
    },
    onShareAppMessage (res) {
      let shareParams = {
        imgInfo: this.imgInfo
      }
      let shareData = JSON.stringify(shareParams)
      let path = '/pages/detect/detect?shareData=' + shareData
      return {
        title: '我在用家图AI识图找家具，快跟上节奏！',
        path: path,
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
    onShow () {
      wx.hideTabBar()
    },
    mounted () {
      this.launchType()
    },
    onHide () {
      this.$store.commit('setTempFilePath', '')
    },
    methods: {
      launchType () {
        if (this.$route.query.shareData) {
          this.launchFromShare(this.$route.query.shareData)
        } else {
          this.imgInfo.tempFilePath = this.tempFilePath
          this.tipsContent = '上传图片中...'
          this.uploadImage()
        }
      },
      async uploadImage () {
        // 封装了多文件上传，需要组装为数组
        let files = [this.tempFilePath]
        let fileParams = {
          files: files
        }
        let res = await uploadImage(fileParams)
        this.uploadedFileStatus = true
        this.tipsContent = '智能分析中...'
        // console.log(JSON.parse(res[0]).data.image_id)
        // console.log(JSON.parse(res[0]).data.image.img3)
        this.imgInfo.imageId = JSON.parse(res[0]).data.image_id
        this.imgInfo.imageSrc = JSON.parse(res[0]).data.image.img3
        this.getImageInfo()
      },
      getImageInfo () {
        wx.getImageInfo({
          src: this.imgInfo.tempFilePath,
          success: (res) => {
            cropper.init.apply(this, [W, H, res.width, res.height, res.path])
            this.showCropper(this.frameInfo)
            this.getCategoryList()
          }
        })
      },
      async getCategoryList () {
        let params = {
          ci: '',
          imsi: ''
        }
        let res = await this.$api.ai.aiCategory(params)
        this.categoryList = res.category_list
        this.geDetectList()
      },
      async geDetectList () {
        let params = {
          image_id: this.imgInfo.imageId,
          // file: this.imgInfo.imageSrc,
          is_active: 1,
          type: this.imgSourceType
        }
        // 上传超过3s增加提示
        setTimeout(() => {
          this.tipsContent = 'AI小图正在努力哦，马上就好啦'
        }, 3000)
        let res = await this.$api.ai.aiDetect(params)
        if (res.object_list.length > 0) {
          this.frameInfo = res.object_list[0].object_info
          this.currentCategory = res.object_list[0].object_info.category_id
          // this.detectedStatus = true
          setTimeout(() => {
            this.detectedStatus = true
          }, 3000)
          console.log(this.frameInfo)
          // console.log(this.currentCategory)
          this.showCropper(this.frameInfo)
          this.reloadGoodsList()
        } else {
          // 调用搜同款接口
          this.searchGoodsByMaxImg()
        }
      },
      // 打开分享页面
      launchFromShare (options) {
        let shareData = JSON.parse(options)
        this.tipsContent = '智能分析中...'
        this.$store.commit('setTempFilePath', shareData.imgInfo.imageSrc)
        this.imgInfo = {
          imageSrc: shareData.imgInfo.imageSrc,
          imageId: shareData.imgInfo.imageId
        }
        wx.getImageInfo({
          src: this.imgInfo.imageSrc,
          success: (res) => {
            cropper.init.apply(this, [W, H, res.width, res.height, res.path])
            this.uploadedFileStatus = true
            this.detectedStatus = true
            this.getCategoryList()
          },
          fail: (err) => {
            console.log(err)
          }
        })
      },
      // 跳到首页
      navToIndex (e) {
        // this.$store.commit('setTabBar', { selectedTabBarIndex: 1, selectedTabBarPath: '/pages/detect/index' })
        wx.navigateBack()
      },
      // 跳转商品页
      goGoodsPage (item) {
        this.$router.push({ path: '/pages/detect/goods', query: { spuId: item.item_info.spu_id, image_id: this.imgInfo.imageId, image_url: item.item_info.image.img0, x: this.frameInfo.x, y: this.frameInfo.y, width: this.frameInfo.width, height: this.frameInfo.height } })
      },
      // 监听滚动条
      goodsResultScroll (e) {
        // console.log(e.mp)
        let detail = e.mp.detail
        let scrollTop = detail.scrollTop
        let deltaY = detail.deltaY
        let isTop = this.goodsListIsTop
        // console.log('scrollTop:' + scrollTop)
        // console.log('!isTop:' + !isTop)
        // console.log('deltaY:' + deltaY)
        // console.log(scrollTop > 10 && !isTop && deltaY < 0)
        if (scrollTop > 10 && !isTop && deltaY < 0) {
          this.listTop = 0
          this.listHeight = maxListHeight
          // this.goodsListIsTop = false
        }
      },
      // 滚动条滚动到顶部自动下拉
      scrollIsToTop () {
        this.switchGoodsListShow()
      },
      changeCategory (e) {
        let categoryId = e.mp.currentTarget.dataset.categoryid
        /* this.setData({
          currentCategory: categoryId
        }); */
        this.currentCategory = categoryId
        this.reloadGoodsList()
      },
      // 点击上拉与下拉操作
      switchGoodsListShow (e) {
        let isTop = this.goodsListIsTop
        // let scrollTop = this.scrollTopVal
        if (!isTop) {
          this.listTop = 0
          this.listHeight = maxListHeight
          this.goodsListIsTop = true
        } else {
          this.listTop = H
          this.listHeight = miniListHeight
          this.goodsListIsTop = false
          // this.currentScrollTopVal = scrollTop
        }
      },
      async reloadGoodsList () {
        this.goodsList = []
        let params = {
          image_url: this.imgInfo.imageSrc,
          p: 1,
          i: 20,
          loc: this.frameInfo.x + '-' + this.frameInfo.y + '-' + this.frameInfo.width + '-' + this.frameInfo.height,
          category_id: this.currentCategory || 0
        }
        let res = await this.$api.ai.aiSearch(params)
        this.goodsList = res.item_list
      },
      // 按整图搜索同款
      async searchGoodsByMaxImg () {
        let params = {
          image_url: this.imgInfo.imageSrc,
          loc: '0-0-1-1'
        }
        let res = await this.$api.ai.aiSearch(params)
        // console.log(res)
        this.frameInfo = res.item_list.length > 0 ? res.item_list[0].item_info : this.frameInfo
        // console.log(frameInfo)
        if (!res.item_list.length) {
          wx.showModal({
            title: '提示',
            content: '哎呀，你传的这个图没有找到相似的商品哦，再换一张图识别试试吧！',
            showCancel: false,
            confirmText: '确认',
            success: (res) => {
              if (res.confirm) {
                // this.navToIndex()
              }
            }
          })
        } else {
          this.frameInfo = this.frameInfo
          this.currentCategory = ''
          this.detectedStatus = true
          this.goodsList = res.item_list
          this.showCropper(this.frameInfo)
        }
      },
      async seekHelp () {
        wx.showToast({
          title: '保存中',
          icon: 'loading'
        })
        let params = {
          image_id: this.imgInfo.imageId,
          x: this.frameInfo.x,
          y: this.frameInfo.y,
          w: this.frameInfo.width,
          h: this.frameInfo.height
        }
        let res = await this.$api.post.postSeekHelp(params)
        this.$router.push({ path: '/pages/post/postDetail', query: { postType: postType.seekHelp, postId: res.post_id } })
      }
    }
  }
</script>
<style>
  /**识别中**/
  .detect-loadding {
    position: relative;
    height: 100%;
  }
  .img-wrap {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }
  .image-big {
    width: 100%;
    height: 100%;
  }
  .big-mark {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
  }
  .loadding-wrap {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin: auto;
    width: 400rpx;
    height: 120rpx;
  }
  .img-loaddingDetect {
    width: 50rpx;
    height: 50rpx;
  }
  .txt-detectLoadding {
    flex: 4;
    color: #d6d6d6;
    text-align: right;
    font-size: 40rpx;
  }
  .txt-uploaddingFile {
    flex: 4;
    margin-left: 20rpx;
    color: #d6d6d6;
    font-size: 40rpx;
  }

  .btn-cancelDetect {
    position: absolute;
    bottom: 90rpx;
    left: 50%;
    margin-left: -50rpx;
    width: 100rpx;
    height: 100rpx;
  }

  /**识别完成**/
  .detect-result {
    height: 100%;
  }

  .image-wrap {
    position: relative;
    z-index: 1;
    overflow: hidden;
    height: 562rpx;
  }
  .show-imgwrap {
    display: block;
    transition: display 0.33s;

    will-change: display;
  }
  .hide-imgwrap {
    display: none;
    transition: display 0.33s;

    will-change: display;
  }
  .img-big2 {
    width: 100%;
    height: 100%;
  }

  .goods-list {
    position: fixed;
    top: 562rpx;
    right: 0rpx;
    bottom: 0rpx;
    left: 0rpx;
    z-index: 99;
    background-color: #fff;
    -webkit-transition: top 0.33s;
    transition: top 0.33s;

    will-change: top;
  }
  .goods-category-box {
    position: relative;
    border-top: 1px solid #e6e6e6;
  }
  .goods-category {
    position: relative;
    display: flex;
    overflow: scroll;
    flex-direction: row;
    padding: 30rpx 0;
    white-space: nowrap;
  }
  .top-down-box {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 5;
    width: 120rpx;
    height: 120rpx;
    background-color: #fff;
  }
  .btn-to-top {
    position: absolute;
    top: 37rpx;
    right: 25rpx;
    display: block;
    width: 60rpx;
    height: 60rpx;
    border: 1px solid #d6d6d6;
    border-radius: 8px;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAhCAYAAADOHBvaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDZCODM5M0NDREVFMTFFNzkyRDJGRjQwNTMyQkQxMDQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDZCODM5M0RDREVFMTFFNzkyRDJGRjQwNTMyQkQxMDQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpENzQzMkFFNUNERTUxMUU3OTJEMkZGNDA1MzJCRDEwNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpENzQzMkFFNkNERTUxMUU3OTJEMkZGNDA1MzJCRDEwNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pn59ZqgAAAHVSURBVHja7Ja7L0NRHMdvW4sunUiYu/ZPaMRjQHLrNTAgdGYwiBITUYwGIQhdpBKD5N7BI9glNiaxSGwWpSEhUt9ffW9y0hTtfYjh/pJPzrnnnHs+Pc/bgGEYms2YBCFd15fsvBy0KR0EyyBtmubIX4kTIAMCZAvyhNfiOMjKFCtlks9C3uyVOAZMEC5TJ2UHkMfcFkfBEYjw+UmpyzGVulPIo26J68AhaOTzBZhT6udZJlEvbSFvcCqWUZxxxBLXQAcvShvJt4MrZXaOIY/YFRfXjWsrcQ86wENpQ5zlRySd4E7dD4hwteIQd6+1U0XWSnnZgFzq2pQfFuduD1UqlrO5yfMq8czpvflt3SC/5chzypnfgTxQiTgNRpl/A93K5tEqkF8i6eW7EkO85X4UT4EU8x+8Gs+rvZUgl3cG2EfxXseoU9+Jh8Gi8jwO9u1+QSCXjTkGCtZMQp4sFctabHN9JWbBmuYwIF9HMqPsnQ3rXhdxU8n9uwoWNJeCn80V5bTsQd4S5Ois87bLKXY7Jti3RC2YFnEPr0QhqayJ5uKoC+xbPjIn4hRxHnSBPuUIaB7Ipe/+r6yer2H5O/E0IHx1+tfHcfhiX+yLfbEv/v/iTwEGAC/JfmAYFbLjAAAAAElFTkSuQmCC')
      no-repeat;
    background-position: center;
    background-size: 30rpx 33rpx;
  }
  .btn-to-down {
    position: absolute;
    top: 37rpx;
    right: 25rpx;
    display: block;
    width: 60rpx;
    height: 60rpx;
    border: 1px solid #d6d6d6;
    border-radius: 8px;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAhCAYAAADOHBvaAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDcxQjlGREVDRTAzMTFFNzkyRDJGRjQwNTMyQkQxMDQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDcxQjlGREZDRTAzMTFFNzkyRDJGRjQwNTMyQkQxMDQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpENzFCOUZEQ0NFMDMxMUU3OTJEMkZGNDA1MzJCRDEwNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpENzFCOUZERENFMDMxMUU3OTJEMkZGNDA1MzJCRDEwNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pmgps0UAAAHaSURBVHja7JdLKARxHMdn0Wo35cLNjdz24OSopCxZBwclKdSWx43LJjclLeUgpIQ8Sp6ZLXHgIHFU9rqu7nPZ8tjW96fv1L+pXTNjJqn516f5P2b/n/m//xvSdV1zEcbBGuMTiURi3WkFFdofhUAciANxIA7E/0dcBSJ+yzKZTARUmuIoOAeH/AC/pGF6TuQDRHQK4izfAUOg6LE0hMcW6GTWsbR4EbwzYxAs+dDgVdYtIQ/SIr4F/aDAgimQ8rC1s7yxaHQM4MZyZ06uCzCpdPE8SHogFeEck1L3KKS6dTltgBnGZUzkHtX7C6n04oqSlYJ0t9Q6XgDLjMu0PwLtLqTymz3W8V0vpOmfNpBpcMB4NTgDLQ6krRy6MLO2lZ4sK5axGAHmvbcWXIMmG9JmeYAaZkkdSbS2aHfL/JDZBx6ZrgdXoKGMVMpu+K7G1SIzuOB0r5b11gWyTDeCS/aAVVrPMvPDnkEfpHm3h4QBusEL0zEKoso7UXZvjOkc6IDUKFdxyOZfGBnfB6UbDaXlavwVtEGa8+pYzHGfNZQJp1niUha3I3V6Hj/JuIG3EvOhB9KsXxcB676u7r/3ft9AZFKMcb0Lw+b+6yS4Pfg3QR34hHTfTQVfAgwAroqDmEDUgBMAAAAASUVORK5CYII=')
      no-repeat;
    background-position: center;
    background-size: 30rpx 33rpx;
  }
  .bdr-left {
    position: absolute;
    top: 32rpx;
    right: 110rpx;
    display: block;
    width: 12rpx;
    height: 75rpx;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAABLCAYAAABEKGYzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEZDNTVCMTFDREU1MTFFNzkyRDJGRjQwNTMyQkQxMDQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEZDNTVCMTJDREU1MTFFNzkyRDJGRjQwNTMyQkQxMDQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4RkM1NUIwRkNERTUxMUU3OTJEMkZGNDA1MzJCRDEwNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4RkM1NUIxMENERTUxMUU3OTJEMkZGNDA1MzJCRDEwNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkeTqn8AAAESSURBVHja3FfLDgMhCATi/3+yNCatcbeAg7o91IR4YZwZfESInh6czeXsopxgZxTACGBMugAKKOkD5AIYbiGRJL6FDDNlGEwAO0wy8+BJMgEcSOIC6L8wCbhxHSTg0eimBajQVJIFJIsBuRNfgOlREaCkhADciyTAxoUe3Lu8WiWSxJ2mmQfT0zFJnnkWSg4BH4G0aV6p0rNlpZ9I+geAtniMQVGAjsnHTeuOaT1eVt01HUrSiE3APehz1jQJuLp6ktQB6upp1TKp0p3h4iFKbFGRstKYnDkanaUAGzdKYs8030D1874WYPX6XqBaj7EGoKkHS1L492b0Z0zeT6ZF+nd/rH9Y6lDSPdBOR7YxXgIMAFuoVdyoKIzOAAAAAElFTkSuQmCC')
      no-repeat;
    background-size: cover;
  }

  .category-item {
    display: inline-block;
    box-sizing: border-box;
    margin: 10rpx;
    padding: 0rpx 30rpx;
    height: 60rpx;
    border: 1px solid #d6d6d6;
    border-radius: 8rpx;
    color: #262626;
    font-size: 28rpx;
    line-height: 56rpx;
  }
  .category-item:first-child {
    margin-left: 20rpx;
  }
  .category-item:last-child {
    margin-right: 40rpx;
  }
  .category-item.current {
    border-color: #e79056;
    background-color: #e79056;
    color: #fff;
  }

  .goods-result {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 20rpx 10rpx;
    background-color: #f2f2f2;
  }
  .tips {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 90rpx;
  }
  .tips .button {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 40rpx;
    margin-left: 20rpx;
    width: 120rpx;
    height: 60rpx;
    background-color: #e79056;
    color: #fff;
  }
  .goods-item {
    display: inline-block;
    margin: 10rpx;
    width: 345rpx;
    height: 490rpx;
  }

  .goods-item:last-child {
    margin-bottom: 40rpx;
  }

  .goods-img {
    width: 345rpx;
    height: 345rpx;
  }
  .goods-title {
    overflow: hidden;
    margin: 10rpx;
    height: 76rpx;
    color: #262626;
    font-size: 28rpx;
    line-height: 38rpx;
  }
  .goods-price {
    margin: 10rpx;
    color: #e79056;
    font-size: 26rpx;
  }
  .cropper_main_container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
    overflow: hidden;
    width: 750rpx;
    height: 100%;
  }
  .cropper_main_container.hidden {
    display: none;
  }

  .cropper_container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  /* button */
  .cropper_toolbar {
    position: absolute;
    bottom: 0;
    z-index: 100;
    width: 100%;
    height: 50px;
    background: black;
    color: white;
    text-align: center;
    font-size: 15px;
    line-height: 50px;
  }

  .cropper_toolbar .button_item {
    position: absolute;
    top: 0;
    width: 200rpx;
  }

  .crop_image_button {
    right: 0;
    color: #1fb922;
  }
  .cancel_button {
    left: 0;
  }

  /* canvas */

  .cropper_canvas_container {
    position: absolute;
    top: 0;
    left: 0;
  }

  /* opacity:0隐藏，如果想看就设置为1，只能在测试机能看到，真机上canvas层级在最高层 */
  .cropper_canvas_container .move_item {
    z-index: 100;
    display: block;
    border-radius: 50%;
    background: white;
    opacity: 1;
    transition: display 0.33s;

    will-change: display;
  }

  .cropper_canvas_container .canvas {
    position: absolute;
    top: 0;
    left: 0;
  }

  /* 因为display:none在真机上会造成无法截取图片，所以这里是通过移到显示区域外来达到隐藏效果的 */
  .original_canvas {
    position: absolute;
    top: 100vh;
    left: 750rpx;
  }
</style>
