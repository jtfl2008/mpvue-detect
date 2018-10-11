<template>
  <div class="authorization">
    <div class="logo">
      <div class="logo-img">
        <img src="../../assets/images/logo.png"
             mode="aspectFill">
      </div>
    </div>
    <div class="slogan">
      <div class="slogan-text">帮你实现所有关于家的创想</div>
      <div class="slogan-title">AI智慧推荐</div>
    </div>
    <div class="login">
      <button class="login-btn"
              open-type="getUserInfo"
              lang="zh_CN"
              @getuserinfo="getUserInfo">
        <div class="icon"><img src="../../assets/images/weixin.png"></div> 微信登录
      </button>
    </div>
  </div>
</template>
<script>
  import { mapState } from 'vuex'
  export default {
    data () {
      return {

      }
    },
    components: {

    },
    computed: {
      ...mapState(['jumpPath'])
    },
    mounted () {

    },
    methods: {
      getUserInfo (e) {
        this.encryptedData = e.mp.detail.encryptedData
        this.iv = e.mp.detail.iv
        this.login()
      },
      async login () {
        let res = await this.wxLogin()
        let params = {
          code: res.code,
          encryptedData: this.encryptedData,
          iv: this.iv
        }
        let resUser = await this.$api.miniapp.authorization(params)
        console.log(resUser)
        if (resUser.error_code === -201) {
          wx.showModal({
            title: '提示',
            content: resUser.error_msg,
            confirmText: '重新登录'
          })
        } else {
          this.$store.commit('saveUser', resUser)
          this.$store.commit('setTabBar', { selectedTabBarIndex: this.jumpPath.jumpTabBarIndex, selectedTabBarPath: this.jumpPath.jumpTabBarPath })
        }
      },
      wxLogin () {
        return new Promise((resolve, reject) => {
          wx.login({
            success: (res) => {
              if (res.code) {
                resolve(res)
              } else {
                reject(res)
              }
            }
          })
        })
      }
    }
  }
</script>
<style lang="scss">
  .logo {
    margin-top: 50rpx;
    text-align: center;
    .logo-img {
      display: inline-block;
      width: 148rpx;
      height: 118rpx;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  .slogan {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-top: 80rpx;
    .slogan-text {
      margin-right: 20rpx;
      width: 42rpx;
      font-size: 42rpx;
      line-height: 48rpx;
    }
    .slogan-title {
      display: flex;
      width: 26rpx;
      font-size: 26rpx;
    }
  }
  .login {
    margin-top: 170rpx;
    padding: 0 60rpx;
    .login-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 90rpx;
      border-radius: 10rpx;
      background: #e79056;
      color: #ffffff;
      font-size: 34rpx;
      .icon {
        display: flex;
        align-items: center;
        margin-right: 30rpx;
        width: 46rpx;
        height: 37rpx;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
</style>
