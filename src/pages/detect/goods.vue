<template>
  <view :key="spuId"
        class="goods-page">
    <view class="to-indexpage"
          @tap="navToIndex">
      <text class="link-to-index">返回首页</text>
    </view>
    <view class="goods-top">
      <image class="goods-img-top"
             :src="goodsInfoImageUrl"
             mode='widthFix' />
      <view class="goods-title-top">{{goodsInfo.title}}</view>
      <text class="goods-price-top">￥{{goodsInfo.price}}</text>
      <text class="goods-link"
            @tap="copyLink(goodsInfo.buy_url)">复制链接</text>
      <!-- <text class="goods-link"
            @tap="copyLink(goodsInfo.buy_url)">去购买</text> -->
      <text class="goods-link"
            @tap="publishShow">一键炫贴</text>
    </view>
    <view class="goods-list">
      <text class="part-title">更多相似商品</text>
      <view class="goods-result">
        <view v-for="item in goodsList"
              :key="item.item_info.product_id"
              class="goods-item"
              @tap="goGoodsPage(item)">
          <image class="goods-img"
                 :src="item.item_info.image.img0"
                 mode='aspectFill' />
          <view class="goods-title">{{item.item_info.title}}</view>
          <view class="goods-price">￥{{item.item_info.price}}</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
  import { postType } from '@/utils/constant'
  export default {
    data () {
      return {
        spuId: '',
        image_url: '',
        image_id: '',
        loc: {
          x: 0,
          y: 0,
          width: 1,
          height: 1
        },
        goodsInfo: {}, // 商品信息
        goodsList: [], // 当前选中分类下的商品列表
        goodsInfoImageUrl: ''
      }
    },
    components: {

    },
    computed: {

    },
    onShareAppMessage (res) {
      return {
        title: '我在用家图AI识图找家具，快跟上节奏！',
        path: `/pages/goods/goods?spuId= ${this.spuId}`,
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
      this.getProductInfo()
    },
    mounted () {
      this.getProductInfo()
    },
    methods: {
      async getProductInfo () {
        this.spuId = this.$route.query.spuId || '2237644'
        this.image_url = this.$route.query.image_url || 'https://img.jiatu.net/picture/75ispf83l!w320_h320'
        this.loc = {
          x: this.$route.query.x,
          y: this.$route.query.y,
          width: this.$route.query.width,
          height: this.$route.query.height
        }
        this.image_id = this.$route.query.image_id
        let params = {
          spu_id: this.spuId
        }
        let res = await this.$api.product.productInfo(params)
        this.goodsInfoImageUrl = res.item_info.image.img0
        this.goodsInfo = res.item_info
        this.getSimilarProducts()
      },
      async getSimilarProducts () {
        let params = {
          image_url: this.image_url,
          p: 1,
          l: 20,
          loc: this.loc.x + '-' + this.loc.y + '-' + this.loc.width + '-' + this.loc.height
        }
        let res = await this.$api.ai.aiSearch(params)
        this.goodsList = res.item_list
      },
      // 事件处理函数
      goGoodsPage (item) {
        /* wx.redirectTo({
          url: `/pages/detect/goods?spuId=${item.item_info.spu_id}`
        }) */
        this.$router.push({ path: '/pages/detect/goods', query: { spuId: item.item_info.spu_id, image_url: item.item_info.image.img0 } })
      },
      // 跳到首页
      navToIndex (e) {
        this.$store.commit('setTabBar', { selectedTabBarIndex: 1, selectedTabBarPath: '/pages/detect/index' })
      },
      copyLink (buyurl) {
        // this.$router.push({ path: '/pages/detect/other', query: { url: buyurl } })
        wx.setClipboardData({
          data: buyurl,
          success: function (res) {
            wx.getClipboardData({
              success: function (res) {
                console.log(res.data) // data
              }
            })
            wx.showModal({
              title: '提示',
              content: '已复制，请在手机浏览器打开链接，查看商品详情。',
              showCancel: false,
              confirmText: '知道了'
            })
          }
        })
      },
      async publishShow () {
        wx.showToast({
          title: '保存中',
          icon: 'loading'
        })
        let params = {
          image_id: this.image_id,
          x: this.loc.x,
          y: this.loc.y,
          w: this.loc.width,
          h: this.loc.height
        }
        let res = await this.$api.post.postShow(params)
        this.$router.push({ path: '/pages/post/postDetail', query: { postType: postType.show, postId: res.post_id, x: this.loc.x, y: this.loc.y, width: this.loc.width, height: this.loc.height } })
      }
    }
  }
</script>
<style>
  /**goods.wxss**/
  .goods-top {
    position: relative;
    padding-bottom: 50rpx;
  }

  .goods-img-top {
    width: 100%;
  }
  .goods-title-top {
    padding: 30rpx 20rpx;
    color: #262626;
    font-size: 36rpx;
    line-height: 58rpx;
  }

  .goods-price-top {
    padding-left: 10rpx;
    color: #e79056;
    font-size: 40rpx;
  }

  .goods-link {
    float: right;
    margin-right: 20rpx;
    width: 200rpx;
    height: 70rpx;
    border-radius: 35rpx;
    background-color: #e79056;
    color: #fff;
    text-align: center;
    font-size: 28rpx;
    line-height: 70rpx;
  }

  .goods-list {
    border-top: 10px solid #f2f2f2;
    background-color: #fff;
  }

  .goods-result {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    box-sizing: border-box;
    padding: 20rpx 10rpx;
  }

  .part-title {
    display: block;
    padding-top: 20rpx;
    text-align: center;
    font-size: 36rpx;
  }

  .goods-item {
    display: inline-block;
    margin: 10rpx;
    width: 345rpx;
    height: 490rpx;
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
</style>
