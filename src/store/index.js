import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
// import notice from './modules/notice'
// import album from './modules/album'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0,
    user_info: {},
    auth_token: '',
    // 缓存跳转路径
    jumpPath: {
      jumpTabBarPath: '/pages/discover/index',
      jumpTabBarIndex: 0
    },
    // 操作栏索引
    selectedTabBarIndex: 0,
    // 操作栏路径
    selectedTabBarPath: '/pages/discover/index',
    // 图片来源类型
    imgSourceType: 1,
    // 缓存的图片
    tempFilePath: '',
    // 缓存帖子上传图片
    postFiles: []
  },
  mutations: {
    increment (state) {
      const obj = state
      obj.count += 1
    },
    decrement (state) {
      const obj = state
      obj.count -= 1
    },
    saveUser (state, params) {
      state.user_info = params.user_info
      state.auth_token = params.auth_token
    },
    setTabBar (state, params) {
      state.selectedTabBarIndex = params.selectedTabBarIndex
      state.selectedTabBarPath = params.selectedTabBarPath
      wx.switchTab({ url: state.selectedTabBarPath })
      // wx.navigateTo({ url: state.selectedTabBarPath })
    },
    setImgSourceType (state, params) {
      state.selectedTabBarIndex = params
    },
    setTempFilePath (state, params) {
      state.tempFilePath = params
    },
    setPostTempFiles (state, params) {
      state.postFiles = state.postFiles.concat(params)
    },
    removePostTempFiles (state) {
      state.postFiles = []
    },
    setJumpPath (state, params) {
      state.jumpPath.jumpTabBarPath = params.jumpTabBarPath
      state.jumpPath.jumpTabBarIndex = params.jumpTabBarIndex
      if (!state.auth_token) return
      state.selectedTabBarPath = params.jumpTabBarPath
      state.selectedTabBarIndex = params.jumpTabBarIndex
    },
    redirectTo () {
      wx.navigateTo({
        url: '/pages/authorization/index'
      })
    },
    logout (state) {
      state.user_info = null
      state.auth_token = ''
    }
  },
  plugins: [
    createPersistedState({
      storage: {
        key: 'jiatuVuex',
        getItem: key => wx.getStorageSync(key),
        setItem: (key, value) => wx.setStorageSync(key, value),
        removeItem: key => {}
      }
    })
  ]
  // modules: {
  //   notice,
  //   album
  // }
})
