<template>
  <div class="discover">
    <div class="discover-item"
         v-for="(item,index1) in posts"
         :key="item.post_info.post_id">
      <div class="discover-item-hd">
        <div class="avatar"
             @click="goPersonalPost(item.user_info.user_id, index1)">
          <div class="avatar-before">
            <image :src="item.user_info.avatar_url" />
          </div>
          <div class="avatar-text">
            {{item.user_info.nickname}}
          </div>
        </div>
        <div class="pubdate">
          {{item.post_info.format_time}}
        </div>
      </div>
      <div class="discover-item-bd"
           @click="goPostDetail(item)">
        <div class="desc">{{item.post_info.description}}</div>
        <div class="tags">
          <text class="tag-item"
                v-for="(tag,index2) in item.post_info.tag_array"
                :key="index2"
                @click.stop="goCurrentTag(tag)">#{{tag}}</text>
        </div>
        <div class="images"
             :class="{'double-col': item.post_info.image_list.length >= 3?true:false}">
          <div class="image-item"
               v-for="(img,index3) in item.post_info.image_list"
               :key="img.image_id"
               :class="'col-'+(index3+1)"
               :style="{backgroundImage:'url(' + img.image_url + ')'}">
            <!-- <image :src="img.image_url"
                   mode="aspectFit"
                   lazy-load="true" /> -->
          </div>
        </div>
      </div>
      <div class="discover-item-ft">
        <button class="item item-share"
                open-type="share"
                :data-desc="item.post_info.description"
                :data-post-id="item.post_info.post_id"
                :data-post-type="item.post_info.type"
                :data-image-url="item.post_info.image_list[0].image_url">
          <span class="icon icon-share"></span>
          <span class="text">
            分享
            <text class="dot"
                  v-if="item.post_info.share_num != 0">
            </text>
            <text v-if="item.post_info.share_num != 0">
              {{item.post_info.share_num}}
            </text>
          </span>
        </button>
        <div class="item item-comment"
             @click="goPostDetail(item)">
          <span class="icon icon-comment"></span>
          <span class="text">
            评论
            <text class="dot"
                  v-if="item.post_info.comment_num != 0">
            </text>
            <text v-if="item.post_info.comment_num != 0">
              {{item.post_info.comment_num}}
            </text>
          </span>
        </div>
      </div>
    </div>
    <div class="no-more"
         v-if="hasMore">
      已经到底了
    </div>
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
        posts: [],
        is_pull: 0,
        hasMore: false,
        p: 1,
        postId: '',
        postTitle: '',
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
    onPullDownRefresh () {
      this.p = 1
      this.is_pull = 1
      this.getPosts()
    },
    onReachBottom () {
      if (this.hasMore) { return }
      this.is_pull = 0
      this.p++
      this.getPosts()
    },
    onShareAppMessage (res) {
      if (res.from === 'button') {
        let dataset = res.target.dataset
        return {
          title: dataset.desc.substring(0, 26) + '...',
          path: `/pages/post/postDetail?postType=${dataset.postType}&postId=${dataset.postId}`,
          imageUrl: dataset.imageUrl
        }
      } else {
        return {
          title: '分享',
          path: this.$route.fullPath
        }
      }
    },
    onShow () {
      this.init()
    },
    methods: {
      init () {
        this.p = 1
        this.posts.length = 0
        this.getPosts()
      },
      async getPosts () {
        let params = {
          p: this.p,
          is_pull: this.is_pull
        }
        let res = await this.$api.post.postIndex(params)
        if (!res.post_list.length) {
          this.hasMore = true
          return
        }
        res.post_list.forEach(item => {
          item.post_info.description = item.post_info.description.length < 40 ? item.post_info.description : item.post_info.description.substring(0, 41) + '...'
        })
        if (this.is_pull === 1) {
          this.posts = res.post_list
          wx.stopPullDownRefresh()
        } else {
          this.posts = this.posts.concat(res.post_list)
        }
      },
      goPostDetail (item) {
        if (!this.auth_token) {
          this.$store.commit('redirectTo')
        } else {
          this.$router.push({ path: '/pages/post/postDetail', query: { postType: item.post_info.type, postId: item.post_info.post_id } })
        }
      },
      goPersonalPost (userId) {
        this.$router.push({ path: '/pages/my/myPost', query: { mode: 'user', userId: userId } })
      },
      goCurrentTag (tag) {
        console.log(tag)
        this.$router.push({ path: '/pages/my/myPost', query: { mode: 'tag', tag: tag } })
      },
      tabBarChange (item, index) {
        this.$store.commit('setTabBar', { selectedTabBarIndex: index, selectedTabBarPath: item.pagePath })
      }
    }
  }
</script>
<style lang="scss">
  .discover {
    padding: 40rpx 40rpx 100rpx;
  }
  .discover-item {
    margin-bottom: 50rpx;
    padding-bottom: 50rpx;
    border-bottom: 1rpx solid #e6e6e6;
  }
  .discover-item-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
  .discover-item-bd {
    margin-top: 30rpx;
    /* .desc {
              display: -webkit-box;
              word-break: break-all;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              overflow: hidden;
              text-overflow: ellipsis;
            } */
    .tags {
      margin-top: 25rpx;
      margin-bottom: 25rpx;
      color: #e99562;
      .tag-item {
        margin-right: 30rpx;
      }
    }
    .images {
      margin-top: 30rpx;
      height: 410rpx;
      .image-item {
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 10rpx;
        background-size: cover;
        background-repeat: no-repeat;
      }
      &.double-col {
        position: relative;
        .image-item {
          position: absolute;
          &.col-1 {
            width: 460rpx;
          }
          &.col-2 {
            position: absolute;
            top: 0;
            right: 0;
            width: 200rpx;
            height: 200rpx;
          }
          &.col-3 {
            top: 210rpx;
            right: 0;
            width: 200rpx;
            height: 200rpx;
          }
        }
      }
    }
  }
  .discover-item-ft {
    display: flex;
    justify-content: flex-end;
    margin-top: 30rpx;
    .item {
      display: flex;
      align-items: center;
    }
    .dot {
      display: inline-block;
      margin: 0 10rpx;
      width: 4rpx;
      height: 4rpx;
      border-radius: 50%;
      background: #464646;
    }
    .icon {
      display: inline-block;
      margin-right: 16rpx;
      width: 32rpx;
      height: 28rpx;
    }
    .text {
      display: flex;
      align-items: center;
    }
    .item-share {
      margin-right: 50rpx;
      .icon-share {
        background: url('../../assets/images/share@2x.png') center center
          no-repeat;
        background-size: contain;
      }
    }
    .item-comment {
      display: flex;
      align-items: center;
      .icon-comment {
        background: url('../../assets/images/comm@2x.png') center center no-repeat;
        background-size: contain;
      }
    }
  }
</style>
