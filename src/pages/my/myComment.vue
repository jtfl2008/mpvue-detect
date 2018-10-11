<template>
  <div class="posts">
    <div class="post-item"
         v-for="(item,index1) in posts"
         :key="index1"
         @click="goDetail(item)">
      <div class="post-item-hd">
        <div class="user-info">
          <div class="avatar">
            <image :src="item.user_info.avatar_url"
                   mode="aspectFill" />
          </div>
          <div class="nick-name">{{item.user_info.nickname}}</div>
        </div>
        <div class="action-bar"> {{item.post_info.format_time}} </div>
      </div>
      <div class="post-item-bd">
        <div class="post-pics">
          <div class="post-pic-item"
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
        <div class="comment-reply"
             v-if="item.comment_list.length>0">
          <div class="comment-reply-item"
               v-for="(list, index2) in item.comment_list"
               :key="list.comment_info.comment_id"
               :class="{'comment-reply-last': (index2+1) === item.comment_list.length}">
            <div class="comment-infor">
              <div class="avatar">
                <div class="avatar-text">
                  <div class="text">回复</div> {{item.user_info.nickname}}
                </div>
              </div>
              <div class="pubdate">
                {{list.comment_info.format_time}}
              </div>
            </div>
            <div class="reply-info">
              {{list.comment_info.content}}
            </div>
          </div>
        </div>
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
        posts: [],
        s: 0,
        hasMore: false
      }
    },
    components: {

    },
    computed: {

    },
    mounted () {
      this.getPosts()
    },
    onReachBottom () {
      if (this.hasMore) { return }
      this.s = this.s + 1
      this.getPosts()
    },
    methods: {
      async getPosts () {
        let params = {
          s: this.s
        }
        let res = await this.$api.comment.commentPostMy(params)
        if (!res.post_list.length) {
          this.hasMore = true
          return
        }
        this.posts = this.posts.concat(res.post_list)
      },
      goDetail (item) {
        this.$router.push({ path: '/pages/post/postDetail', query: { postType: item.post_info.type, postId: item.post_info.post_id } })
      }
    }
  }
</script>
<style lang="scss">
  .posts {
    padding: 40rpx;
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
    .post-item-bd {
      padding-left: 100rpx;
      .post-pics {
        display: flex;
        flex-wrap: wrap;
        margin-top: 30rpx;
        margin-bottom: 20rpx;
      }
      .post-pic-item {
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
      padding-left: 100rpx;
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
          .text {
            display: inline-block;
            color: #464646;
          }
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
    }
  }
</style>
