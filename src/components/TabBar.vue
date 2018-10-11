<template>
  <div class="tab-bar">
    <div class="tab-bar-item"
         v-for="(item,index) in lists"
         :key="index"
         :class="[{'selected': config.selectedTabBarIndex == index, 'special': index === 2}, 'tab-bar-item-'+ (index+1)]"
         @click="tabBarChange(item,index)">
      <div class="icon">
        <image :src="config.selectedTabBarIndex === index ? item.selectedIconPath: item.iconPath " />
      </div>
      <div class="title"
           v-if="!!item.text"> {{item.text}} </div>
    </div>
  </div>
</template>
<script>
  import { mapState } from 'vuex'
  import { wxChooseImage } from '@/utils/wxApiPromisify'
  export default {
    props: ['config'],
    data () {
      return {
        lists: [
          {
            'pagePath': '/pages/discover/index',
            'iconPath': '/static/images/discover.png',
            'selectedIconPath': '/static/images/discover_active.png',
            'text': '发现'
          },
          {
            'pagePath': '/pages/detect/index',
            'iconPath': '/static/images/photo.png',
            'selectedIconPath': '/static/images/photo_active.png',
            'text': '识图'
          },
          {
            'pagePath': '/pages/post/index',
            'iconPath': '/static/images/upload.png',
            'selectedIconPath': '/static/images/upload.png'
            // 'text': '上传'
          },
          {
            'pagePath': '/pages/notice/index',
            'iconPath': '/static/images/notice.png',
            'selectedIconPath': '/static/images/notice_active.png',
            'text': '消息'
          },
          {
            'pagePath': '/pages/my/index',
            'iconPath': '/static/images/my.png',
            'selectedIconPath': '/static/images/my_active.png',
            'text': '我的'
          }
        ]
      }
    },
    components: {

    },
    computed: {
      ...mapState(['selectedTabBarIndex', 'selectedTabBarPath', 'auth_token'])
    },

    onShow () {
      // console.log('onShow')
      this.init()
    },
    mounted () {
      // console.log('mounted')
      this.init()
    },
    methods: {
      init () {
        this.config.selectedTabBarIndex = this.selectedTabBarIndex
        let url = this.selectedTabBarPath
        wx.switchTab({ url })
        // wx.navigateTo({ url })
      },
      tabBarChange (item, index) {
        // console.log('内部' + item, index)
        if (index === 1) {
          if (!this.auth_token) {
            this.$store.commit('redirectTo')
            console.log(item)
            this.$store.commit('setJumpPath', {
              jumpTabBarPath: item.pagePath,
              jumpTabBarIndex: index
            })
            return
          }
        } else if (index === 2) {
          if (!this.auth_token) {
            this.$store.commit('redirectTo')
            return
          } else {
            this.chooseImage()
            return
          }
        } else if (index === 3) {
          wx.showToast({
            title: '功能还在开发中',
            icon: 'none',
            mask: true
          })
          return
        } else if (index === 4) {
          if (!this.auth_token) {
            this.$store.commit('redirectTo')
            this.$store.commit('setJumpPath', {
              jumpTabBarPath: item.pagePath,
              jumpTabBarIndex: index
            })
            return
          }
        }
        if (this.config.selectedTabBarIndex === index) return
        this.config.selectedTabBarIndex = index
        this.$emit('change', item, index)
      },
      async chooseImage (e) {
        let resPics = await wxChooseImage()
        let newPics = resPics.map(item => ({ 'image_id': 0, 'image_url': item }))
        let files = []
        files = files.concat(newPics)
        this.$store.commit('setPostTempFiles', files)
        setTimeout(() => {
          this.$router.push({ path: '/pages/post/postPublish' })
        }, 1000)
      }
    }
  }
</script>
<style lang="scss">
  .tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 10;
    display: flex;
    justify-content: space-around;
    box-sizing: border-box;
    // padding: 10rpx 0;
    width: 100%;
    height: 100rpx;
    border-top: 1px solid #d6d6d6;
    background: #ffffff;
    .tab-bar-item {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: flex-end;
      color: #262626;
      font-size: 24rpx;
      &.tab-bar-item-1 {
        .icon {
          width: 42rpx;
          height: 42rpx;
        }
      }
      &.tab-bar-item-2 {
        .icon {
          width: 40rpx;
          height: 34rpx;
        }
      }

      &.tab-bar-item-3 {
        justify-content: center;
        .icon {
          width: 90rpx;
          height: 70rpx;
          text-align: center;
        }
      }
      &.tab-bar-item-4 {
        .icon {
          width: 34rpx;
          height: 38rpx;
        }
      }
      &.tab-bar-item-5 {
        .icon {
          width: 38rpx;
          height: 38rpx;
        }
      }
      .icon {
        text-align: center;
        image {
          width: 100%;
          height: 100%;
        }
      }
      .title {
        margin-top: 10rpx;
        color: #262626;
        text-align: center;
        font-size: 24rpx;
      }
      &.selected {
        .title {
          color: #db9461;
        }
      }
    }
  }
</style>
