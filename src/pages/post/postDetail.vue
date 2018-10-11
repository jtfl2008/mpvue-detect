<template>
  <div class="card-page">
    <div class="silder"
         v-if="postType == 1">
      <swiper class="swiper"
              interval="5000"
              duration="1000"
              :current="0"
              @change="swiperChange"
              :current-item-id="currentItemId">
        <swiper-item v-for="item in images"
                     :key="item.id"
                     :item-id="item.image_id+','+item.image_url">
          <image :src="item.image_url"
                 class="slide-image"
                 mode="aspectFit" />
        </swiper-item>
      </swiper>
      <text class="swiper-tip">
        {{current}} / {{imagesLen}}
      </text>
      <div class="zone"
           @click="goCurrentResult"></div>
    </div>

    <div class="card-content">
      <div class="card-hd">
        <div class="avatar"
             @click="goPersonalPost(user_id)">
          <div class="avatar-before">
            <image :src="avatar_url" />
          </div>
          <div class="avatar-text">
            {{nickname}}
          </div>
        </div>
        <div class="pubdate">
          {{format_time}}
        </div>
      </div>
      <div class="crad-desc">
        <text class="desc-text"
              v-if="!!description">{{description}}</text>
        <div class="desc-images"
             v-if="postType != 1">
          <div class="image-item source-image">
            <image :src="imageTargetUrl"
                   mode="aspectFit" />
            <view class="title">原图</view>
            <div class="type"
                 v-if="postType == 2">
              <image src="/static/images/qiuzhu.png" />
            </div>
            <div class="type"
                 v-if="postType == 3">
              <image src="/static/images/xuan.png" />
            </div>
          </div>
          <div class="image-item target-image">
            <scroll-view class="cropper_main_container"
                         :style="{height:cropperData.imageInfo.h+'px'}">
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
                                    :data-key="index"></movable-view>
                    </block>
                  </block>

                  <movable-view class="move_all"
                                :style="{width:cropperCenterMoveArea.width+'px', height:cropperCenterMoveArea.height+'px'}"
                                direction="all"
                                :x="cropperCenterMoveArea.x"
                                :y="cropperCenterMoveArea.y"></movable-view>

                </movable-area>
              </view>
            </scroll-view>
            <view class="title">编辑源结果</view>
          </div>
        </div>
        <div class="detect-reslut"
             @click="goCurrentResult"
             v-if="postType != 1">
          查看识图结果
        </div>
      </div>
      <div class="crad-tag"
           v-if="tags.length > 0">
        <text v-for="item in tags"
              :key="item"
              @click="goCurrentTag(item)"
              class="tag-item">#{{item}}</text>
      </div>
      <div class="card-comment">
        <div class="card-comment-hd">
          所有评论
        </div>
        <div class="card-comment-bd">
          <div class="avatar">
            <div class="avatar-before">
              <image :src="avatar_url" />
            </div>
            <div class="comments-tip"
                 @click="showInputBar($route.query.postId,'comment','')">
              说出你这一刻的想法
            </div>
          </div>
          <div class="comments">
            <div class="comment-item"
                 v-for="(item, index1 ) in comments"
                 :key="index1">
              <div class="comment-item-hd">
                <div class="avatar">
                  <div class="avatar-before">
                    <image :src="item.comment_info.user_info.avatar_url" />
                  </div>
                  <div class="avatar-text">
                    {{item.comment_info.user_info.nickname}}
                  </div>
                </div>
                <div class="pubdate">
                  {{item.comment_info.format_time}}
                </div>
              </div>
              <div class="comment-item-bd">
                <div class="images"
                     v-if="item.comment_info.image_list.length>0"
                     :class="{hidden: item.comment_info.comment_id === currentCommentId}">
                  <div class="image-item"
                       v-for="(list,index2) in item.comment_info.image_list"
                       :key="index2"
                       @click="showSlider(item)">
                    <image :src="list.square_image_url"
                           lazy-load="true" />
                  </div>
                </div>
                <div class="silder"
                     @click.stop="showImages(item)"
                     :class="{active: item.comment_info.comment_id === currentCommentId}">
                  <swiper class="swiper"
                          interval="5000"
                          duration="1000"
                          @change="swiperChange"
                          :current-item-id="currentItemId">
                    <swiper-item v-for="list in item.comment_info.image_list"
                                 :key="list.image_id"
                                 :item-id="list.image_id+','+list.big_image_url">
                      <image :src="list.big_image_url"
                             class="slide-image"
                             mode="aspectFit" />
                    </swiper-item>
                  </swiper>
                  <text class="swiper-tip">
                    {{current}} / {{imagesLen}}
                  </text>
                  <div class="zone"
                       @click="goCurrentResult"></div>
                </div>
                <div class="commet-content"
                     @click="showInputBar(item.comment_info.comment_id, 'reply',item.comment_info.user_info.nickname)">
                  {{item.comment_info.content}}
                </div>
                <div class="comment-reply"
                     v-if="item.comment_info.child_list.length>0">
                  <div class="comment-reply-item"
                       v-for="(list, index2) in item.comment_info.child_list"
                       :key="list.comment_info.comment_id"
                       :class="{'comment-reply-last': (index2+1) === item.comment_info.child_list.length}"
                       @click="showInputBar(list.comment_info.comment_id, 'reply', list.comment_info.user_info.nickname)">
                    <div class="comment-infor">
                      <div class="avatar">
                        <div class="avatar-text">
                          {{list.comment_info.user_info.nickname}}{{user_id === list.comment_info.user_info.user_id ? '(作者)': ''}}
                        </div>
                      </div>
                      <div class="pubdate">
                        {{list.comment_info.format_time}}
                      </div>
                    </div>
                    <div class="reply-info">
                      <text>回复</text>
                      <text class="reply-info-name"> {{list.comment_info.reply_comment.user_info.nickname}}： </text>
                      <text class="reply-info-content">{{list.comment_info.content}}</text>
                    </div>
                  </div>
                  <!-- <div class="more-reply">
                    <span class="more-reply-button"
                          @click="loadMoreReply(item, index1)">{{item.comment_info.text}}</span>
                  </div> -->
                </div>
              </div>
            </div>
            <div class="no-more"
                 v-if="hasMore">
              已经到底了
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="input-bar"
         v-if="isShowInputBar">
      <input type="text"
             class="text"
             focus="true"
             :placeholder="placeholder"
             v-model.lazy="content"
             cursor-spacing="15"
             confirm-type="发送"
             @confirm="add">
      <!-- <button class="button"
              @click="add">发送</button> -->
    </div>
    <div class="operation-bar"
         v-if="isOperationBar">
      <div class="bar-item">
        <button class="icon icon-share"
                open-type="share">
          分享
        </button>
        <div class="count">
          <text class="dot"
                v-if="share_num!=0"></text>
          <text class="num"
                v-if="share_num!=0"> {{share_num}}</text>
        </div>
      </div>
      <div class="bar-item">
        <button class="icon icon-comment"
                @click="showInputBar($route.query.postId,'comment','')">
          评论
        </button>
        <div class="count">
          <text class="dot"
                v-if="comment_num!=0"></text>
          <text class="num"
                v-if="comment_num!=0"> {{comment_num}}</text>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { postType } from '@/utils/constant'
  const device = wx.getSystemInfoSync()
  const W = device.windowWidth - 40
  console.log(W)
  const H = 562 * W / 750
  let cropper = require('../detect/welCropper')
  export default {
    data () {
      return {
        postType: postType.common,
        post_id: '',
        nickname: '',
        avatar_url: '',
        user_id: '',
        images: [],
        imageTargetUrl: '',
        imagesLen: 0,
        description: '',
        tags: [],
        format_time: '',
        comment_num: '',
        share_num: '',
        current: 1,
        comments: [],
        s: 0,
        hasMore: false,
        placeholder: '说出你这一刻的想法',
        content: '',
        isShowInputBar: false,
        commentType: 'comment',
        currentCommentId: '',
        isOperationBar: true,
        detectImageInfo: {
          imageId: '',
          imageSrc: ''
        },
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
        }
      }
    },
    components: {
    },
    computed: {
    },
    onReachBottom () {
      if (this.hasMore) { return }
      this.s = this.s + 1
      this.getCommentPostSlist()
    },
    onShareAppMessage (res) {
      if (res.from === 'button') {
        // 来自页面内转发按钮
        console.log(res.target)
      }
      return {
        title: '帖子详情',
        path: this.$route.fullPath
      }
    },
    onShow () {
      this.getPostDetail()
    },
    methods: {
      // 普通助帖
      async getPostDetail () {
        this.description = ''
        this.current = 1
        this.postType = this.$route.query.postType
        this.post_id = this.$route.query.postId
        let params = {
          post_id: this.post_id
        }
        let res = await this.$api.post.postDetail(params)
        this.images = res.post_info.image_list
        this.imagesLen = this.images.length
        this.description = res.post_info.description
        this.tags = res.post_info.tag.length > 0 ? res.post_info.tag.split(' ') : []
        this.format_time = res.post_info.format_time
        this.nickname = res.user_info.nickname
        this.user_id = res.user_info.user_id
        this.avatar_url = res.user_info.avatar_url
        this.comment_num = res.post_info.comment_num
        this.share_num = res.post_info.share_num
        this.postType = res.post_info.type
        if (this.postType === postType.show || this.postType === postType.seekHelp) {
          this.imageTargetUrl = this.images[1].image_url
          this.imgInfo.imageSrc = this.imageTargetUrl
          this.imgInfo.imageId = this.images[1].image_id
          this.detectImageInfo = this.imgInfo
          wx.getImageInfo({
            src: this.imgInfo.imageSrc,
            success: (res) => {
              cropper.init.apply(this, [W, H, res.width, res.height, res.path])
              // 参数有差异,需要转换
              this.frameInfo = this.images[1].loc ? this.images[1].loc : this.frameInfo
              this.frameInfo.width = this.images[1].loc.w
              this.frameInfo.height = this.images[1].loc.h
              // console.log(this.frameInfo)
              this.showCropper(this.frameInfo)
            }
          })
        } else {
          // 顶部轮播默认图片参数设置
          this.detectImageInfo = {
            imageId: this.images[0].image_id,
            imageSrc: this.images[0].image_url
          }
        }
        this.comments.length = 0
        this.getCommentPostSlist()
      },
      swiperChange (e) {
        this.current = e.mp.detail.current + 1
        let currentInfo = e.mp.detail.currentItemId.split(',')
        this.detectImageInfo = {
          imageId: currentInfo[0],
          imageSrc: currentInfo[1]
        }
      },
      // 普通评论列表
      async getCommentPostSlist () {
        let params = {
          postId: this.post_id,
          s: this.s,
          n: 20
        }
        let res = await this.$api.comment.commentPostSlist(params)
        if (!res.comment_list.length) {
          this.hasMore = true
          return
        }
        this.comments = this.comments.concat(res.comment_list)
      },
      showInputBar (postId, type, nickname) {
        // 评论类型： 普通评论，求助帖评论，炫贴评论
        // 求助帖评论，炫贴评论
        if (this.postType === postType.show || this.postType === postType.seekHelp) {
          this.$router.push({ path: '/pages/post/postPublish', query: { postType: this.postType, postId: this.post_id } })
          //  普通评论
        } else {
          this.isOperationBar = false
          this.post_id = postId
          this.commentType = type
          this.isShowInputBar = true
          if (this.commentType === 'comment') {
            this.placeholder = '说出你这一刻的想法'
          } else {
            this.placeholder = '回复' + nickname + ':'
          }
        }
      },
      async commentPostAdd () {
        // input使用lazy修饰符存在问题
        let params = {
          postId: this.post_id,
          content: this.content
        }
        let res = await this.$api.comment.commentPostAdd(params)
        if (!res.comment_info) return
        wx.showToast({
          title: '成功',
          icon: 'success'
        })
        this.finshed()
      },
      async commentPostReply () {
        let params = {
          replyId: this.post_id,
          content: this.content
        }
        let res = await this.$api.comment.commentPostReply(params)
        if (!res.comment_info) return
        this.finshed()
      },
      add () {
        setTimeout(() => {
          if (this.commentType === 'comment') {
            this.commentPostAdd()
          } else {
            this.commentPostReply()
          }
        }, 200)
      },
      finshed () {
        this.s = 0
        this.getCommentPostSlist()
        this.getPostDetail()
        this.isShowInputBar = false
        this.content = ''
        this.isOperationBar = true
      },
      goPersonalPost (userId) {
        this.$router.push({ path: '/pages/my/myPost', query: { mode: 'user', userId: userId } })
      },
      goCurrentTag (tag) {
        this.$router.push({ path: '/pages/my/myPost', query: { mode: 'tag', tag: tag } })
      },
      goCurrentResult () {
        let shareParams = {
          imgInfo: this.detectImageInfo
        }
        let shareData = JSON.stringify(shareParams)
        console.log(shareData)
        this.$router.push({ path: '/pages/detect/detect', query: { shareData: shareData } })
      },
      showSlider (item) {
        this.detectImageInfo = {
          imageId: item.comment_info.image_list[0].image_id,
          imageSrc: item.comment_info.image_list[0].big_image_url
        }
        this.currentCommentId = item.comment_info.comment_id
      },
      showImages (item) {
        this.currentCommentId = ''
      }
    }
  }
</script>
<style lang="scss">
  .silder {
    position: relative;
    height: 570rpx;
    .swiper {
      height: 100%;
      .slide-image {
        width: 100%;
        height: 100%;
      }
    }
    .swiper-tip {
      position: absolute;
      bottom: 30rpx;
      left: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60rpx;
      height: 30rpx;
      border-radius: 10rpx;
      background: #666;
      color: #ffffff;
      font-size: 24rpx;
    }
    .zone {
      position: absolute;
      right: 30rpx;
      bottom: 30rpx;
      width: 80rpx;
      height: 80rpx;
      background: url(../../assets/images/shibie@2x.png) center center no-repeat;
      background-size: cover;
    }
  }
  .avatar {
    display: flex;
    .avatar-before {
      margin-right: 20rpx;
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-size: cover;
      image {
        width: 60rpx;
        height: 60rpx;
        border-radius: 30rpx;
      }
    }
    .avatar-text {
      display: flex;
      align-items: center;
      color: #262626;
    }
  }
  .pubdate {
    color: #8f8f8f;
  }
  .card-content {
    padding: 40rpx 40rpx 150rpx;
    .card-hd {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30rpx;
    }
    .crad-desc {
      margin-bottom: 60rpx;
      color: #464646;
      line-height: 50rpx;
      .desc-images {
        .image-item {
          position: relative;
          margin-top: 50rpx;
          // background: #f00;
          .type {
            position: absolute;
            top: -30rpx;
            right: 10rpx;
            width: 120rpx;
            height: 105rpx;
            image {
              width: 100%;
              height: 100%;
            }
          }

          .title {
            margin-top: 25rpx;
            text-align: center;
            font-size: 24rpx;
          }
        }

        .target-image {
          .cropper_main_container {
            position: relative;
            width: 100%;
          }
        }
      }
      .detect-reslut {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 50rpx;
        height: 80rpx;
        border-radius: 10rpx;
        background-color: #e79056;
        color: #ffffff;
      }
    }
    .crad-tag {
      display: flex;
      padding-bottom: 60rpx;
      border-bottom: 1px solid #e6e6e6;
      .tag-item {
        margin-right: 20rpx;
        color: #f79056;
      }
    }
    .card-comment {
      .card-comment-hd {
        margin-top: 60rpx;
        margin-bottom: 60rpx;
        color: #262626;
        font-size: 36rpx;
      }
      .comments-tip {
        display: flex;
        align-items: center;
        margin-bottom: 50rpx;
        padding: 10rpx 20rpx;
        width: 100%;
        border: 2rpx solid #e6e6e6;
        border-radius: 10rpx;
        color: #b2b2b2;
        font-size: 24rpx;
      }
    }
  }
  .operation-bar {
    position: fixed;
    bottom: 0;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 9rpx 140rpx;
    width: 100%;
    border-top: 1px solid #e6e6e6;
    background: #ffffff;
    .bar-item {
      display: flex;
    }
    .icon {
      padding-left: 46rpx;
      width: 100rpx;
      white-space: nowrap;
    }
    .icon-share {
      background: url(../../assets/images/share@2x.png) left center no-repeat;
      background-size: 26rpx auto;
    }
    .icon-comment {
      background: url(../../assets/images/comm@2x.png) left center no-repeat;
      background-size: 26rpx auto;
    }
    .count {
      position: relative;
      display: flex;
      align-items: center;
    }

    .dot {
      position: absolute;
      top: 30rpx;
      left: 15rpx;
      display: inline-block;
      width: 4px;
      height: 4px;
      border-radius: 2px;
      background: #464646;
    }
    .num {
      margin-left: 30rpx;
    }
  }
  .comments {
    .comment-item {
      margin-bottom: 30rpx;
    }
    .comment-item-hd {
      display: flex;
      align-items: top;
      justify-content: space-between;
      margin-bottom: 10rpx;
    }
    .comment-item-bd {
      padding-bottom: 20px;
      padding-left: 86rpx;
      border-bottom: 1px solid #e6e6e6;
      .commet-content {
        line-height: 50rpx;
      }
      .images {
        display: flex;
        flex-wrap: wrap;
        margin-top: 30rpx;
        margin-bottom: 20rpx;
        &.hidden {
          display: none;
        }
      }
      .image-item {
        margin-right: 10rpx;
        margin-bottom: 10rpx;
        width: 180rpx;
        height: 180rpx;
        image {
          width: 100%;
          height: 100%;
        }
      }
      .silder {
        display: none;
        margin-bottom: 20rpx;
        &.active {
          display: block;
        }
      }
    }
    .comment-reply {
      margin-top: 50rpx;
      padding: 0 30rpx;
      border-radius: 10rpx;
      background: #f7f7f7;
    }
    .comment-reply-item {
      overflow: hidden;
      padding-top: 30rpx;
      padding-bottom: 30rpx;
      border-bottom: 1rpx solid #e6e6e6;

      &.comment-reply-last {
        border-bottom: none;
      }
      .comment-infor {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10rpx;
      }
      .avatar-text {
        color: #8f8f8f;
      }
      .reply-info {
        .reply-info-name {
          margin-left: 10rpx;
          color: #8f8f8f;
        }
        .reply-info-content {
          // display: -webkit-box;
          // overflow: hidden;
          // -webkit-box-orient: vertical;
          text-overflow: ellipsis;

          // -webkit-line-clamp: 2;
        }
      }
    }
    .more-reply {
      padding-bottom: 30rpx;
      text-align: right;
      .more-reply-button {
        display: inline-block;
        padding-right: 20rpx;
        // background: url(../../assets/images/more-comments@3x.png) right center
        //   no-repeat;
        // background-size: 10rpx auto;
        color: #00a299;
        font-size: 26rpx;
      }
    }
  }
</style>
