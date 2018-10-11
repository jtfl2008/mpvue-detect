<template>
  <div class="my-post">
    <div class="post-item"
         v-for="(item,index1) in posts"
         :key="index1">
      <div class="post-item-hd">
        <div class="user-info">
          <div class="avatar">
            <image :src="item.user_info.avatar_url"
                   mode="aspectFill" />
          </div>
          <div class="nick-name">{{item.user_info.nickname}}</div>
        </div>
        <div class="action-bar"
             @click="action(item)"
             v-if="mode === 'user'"></div>
      </div>
      <div class="post-item-bd"
           @click="goDetail(item)">
        <div class="images">
          <div class="image-item"
               v-for="(list,index2) in item.post_info.image_list"
               :key="index2">
            <image :src="list.image_url"
                   lazy-load="true" />
          </div>
        </div>
        <div class="post-desc">
          {{item.post_info.description}}
        </div>
      </div>
      <div class="post-item-ft">
        <div class="reply-count">回复：（{{item.post_info.comment_num}}）</div>
        <div class="time">{{item.post_info.format_time}}</div>
      </div>
    </div>
    <div class="no-more"
         v-if="hasMore">
      已经到底了
    </div>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        userId: '',
        tag: '',
        mode: '',
        posts: [],
        actions: ['编辑', '删除'],
        s: 0,
        hasMore: false
      }
    },
    components: {

    },
    computed: {
    },
    onShow () {
      this.getType()
    },
    onReachBottom () {
      if (this.hasMore) return
      this.s++
      this.getPosts()
    },
    methods: {
      getType () {
        this.mode = this.$route.query.mode
        if (this.mode === 'user') {
          this.userId = this.$route.query.userId
          wx.setNavigationBarTitle({
            title: '帖子列表'
          })
        } else {
          this.tag = this.$route.query.tag
          wx.setNavigationBarTitle({
            title: '标签列表'
          })
        }
        this.posts.length = 0
        this.getPosts()
      },
      async getPosts () {
        let res = {
          post_list: []
        }
        if (this.mode === 'user') {
          let params = {
            userId: this.userId,
            s: this.s
          }
          res = await this.$api.post.userPosts(params)
        } else {
          let params = {
            tag: this.tag,
            s: this.s
          }
          res = await this.$api.post.tagPosts(params)
        }
        if (!res.post_list.length) {
          this.hasMore = true
          return
        }
        this.posts = res.post_list
      },
      action (item) {
        // console.log(item)
        wx.showActionSheet({
          itemList: this.actions,
          success: async (res) => {
            // console.log(res.tapIndex)
            if (res.tapIndex === 0) {
              this.$router.push({ path: '/pages/post/postPublish', query: { mode: 'modify', postId: item.post_info.post_id } })
            } else if (res.tapIndex === 1) {
              let params = {
                post_id: item.post_info.post_id
              }
              await this.$api.post.postDelete(params)
              this.getType()
            }
          }
        })
      },
      goDetail (item) {
        this.$router.push({ path: '/pages/post/postDetail', query: { postType: item.post_info.type, postId: item.post_info.post_id } })
      }
    }
  }
</script>
<style lang="scss">
  .my-post {
    padding: 40rpx;
    background: #fff;
  }
  .post-item {
    margin-bottom: 40rpx;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #e6e6e6;
    .post-item-hd {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .user-info {
      display: flex;
      align-items: center;
      .avatar {
        overflow: hidden;
        margin-right: 30rpx;
        width: 66rpx;
        height: 66rpx;
        image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
    }
    .action-bar {
      width: 32rpx;
      height: 12rpx;
      background: url(../../assets/images/icon-operation-bar.png) center center
        no-repeat;
      background-size: 32rpx auto;
      box-sizing: content-box;
      padding: 10rpx;
    }
    .post-item-bd {
      padding-left: 100rpx;
      .images {
        display: flex;
        flex-wrap: wrap;
        margin-top: 30rpx;
        margin-bottom: 20rpx;
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
    }
    .post-item-ft {
      display: flex;
      justify-content: space-between;
      margin-top: 15rpx;
      padding-left: 100rpx;
      color: #909090;
      font-size: 24rpx;
    }
  }
</style>
