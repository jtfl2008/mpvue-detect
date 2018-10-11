<template>
  <div>
    <web-view :src="src"></web-view>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        src: ''
      }
    },
    components: {

    },
    computed: {

    },
    onShow () {
      wx.hideTabBar()
    },
    mounted () {
      this.src = this.$route.query.url
    },
    methods: {

    }
  }
</script>
<style lang="scss">
</style>
