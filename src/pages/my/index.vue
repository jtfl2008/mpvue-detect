<template>
  <div class="user-center">
    <div class="user-cnetr-info">
      <img class="user-bg"
           src="../../assets/images/bg.png">
      <div class="user-info">
        <div class="avatar">
          <image :src="user_info ? user_info.avatar_url :'https://img.jiatu.net/avatar/default.jpg!w180_h180'"
                 mode="aspectFill" />
        </div>
        <div class="nickname"> {{user_info ? user_info.nickname : ''}} </div>
      </div>
    </div>
    <div class="user-center-tool">
      <div class="weui-cells weui-cells_after-title">
        <div class="weui-cell weui-cell_access"
             hover-class="weui-cell_active"
             @click="goPersonalPost">
          <div class="weui-cell__bd">我的贴子</div>
          <div class="weui-cell__ft weui-cell__ft_in-access"></div>
        </div>
        <div class="weui-cell weui-cell_access"
             hover-class="weui-cell_active"
             @click="goPersonalComment">
          <div class="weui-cell__bd">我的评论</div>
          <div class="weui-cell__ft weui-cell__ft_in-access"></div>
        </div>
        <div class="weui-cell weui-cell_access"
             hover-class="weui-cell_active"
             @click="goPersonalNotice">
          <div class="weui-cell__bd">我的消息</div>
          <div class="weui-cell__ft weui-cell__ft_in-access"></div>
        </div>
        <div class="weui-cell weui-cell_access"
             hover-class="weui-cell_active"
             @click="goPersonalFeedback">
          <div class="weui-cell__bd">建议反馈</div>
          <div class="weui-cell__ft weui-cell__ft_in-access"></div>
        </div>
        <div class="weui-cell weui-cell_access"
             hover-class="weui-cell_active"
             @click="logout">
          <div class="weui-cell__bd">退出</div>
          <div class="weui-cell__ft weui-cell__ft_in-access"></div>
        </div>
      </div>
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
        userId: '',
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
      ...mapState(['auth_token', 'user_info', 'selectedTabBarIndex', 'selectedTabBarPath'])
    },
    mounted () {
      this.userId = this.user_info.user_id
    },
    methods: {
      goPersonalPost () {
        this.$router.push({ path: '/pages/my/myPost', query: { mode: 'user', userId: this.userId } })
      },
      goPersonalComment () {
        this.$router.push({ path: '/pages/my/myComment', query: { mode: 'user', userId: this.userId } })
      },
      goPersonalNotice () {
        wx.showToast({
          title: '功能开发中，请稍待',
          icon: 'none',
          mask: true
        })
        // this.$router.push({ path: '/pages/notice/index', query: { mode: 'user', userId: this.userId } })
      },
      goPersonalFeedback () {
        wx.showToast({
          title: '功能开发中，请稍待',
          icon: 'none',
          mask: true
        })
      },
      tabBarChange (item, index) {
        this.$store.commit('setTabBar', { selectedTabBarIndex: index, selectedTabBarPath: item.pagePath })
      },
      logout () {
        this.$store.commit('setTabBar', { selectedTabBarIndex: 0, selectedTabBarPath: '/pages/discover/index' })
        this.$store.commit('logout')
      }
    }
  }
</script>
<style lang="scss">
  .login-btn {
    color: #ffffff;
  }
  .user-center {
    height: 100%;
    .user-cnetr-info {
      position: relative;
      // text-align: center;
      .user-bg {
        top: 0;
        left: 0;
        width: 100%;
      }
      .user-info {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        text-align: center;
      }
      .avatar {
        display: inline-block;
        margin-top: 70rpx;
        width: 140rpx;
        height: 140rpx;

        image {
          width: 100%;
          height: 100%;
          border: 4rpx solid #fff;
          border-radius: 50%;
        }
      }
      .nickname {
        margin-top: 25rpx;
        color: #ffffff;
        font-size: 30rpx;
      }
    }
    .weui-cell_access {
      padding: 33rpx 30rpx;
    }
    .weui-cells:before {
      border-top: none;
    }
    .weui-cell:before {
      border-top: 1rpx solid #d9d9d9;
    }
    .weui-cell__bd {
      color: #262626;
      font-size: 32rpx;
    }
  }
</style>
