<template>
  <div class="">
    notice
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
      ...mapState(['selectedTabBarIndex', 'selectedTabBarPath'])
    },
    mounted () {

    },
    methods: {
      tabBarChange (item, index) {
        this.$store.commit('setTabBar', { selectedTabBarIndex: index, selectedTabBarPath: item.pagePath })
      }
    }
  }
</script>
<style lang="scss">
</style>
