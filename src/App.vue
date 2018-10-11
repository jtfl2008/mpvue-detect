
<script>
  export default {
    created () {
      wx.hideTabBar()
      this.$store.commit('setTabBar', { selectedTabBarIndex: 0, selectedTabBarPath: '/pages/discover/index' })
      this.$store.commit('setJumpPath', { jumpTabBarIndex: 0, jumpTabBarPath: '/pages/discover/index' })
    }
  }
</script>

<style>
</style>
