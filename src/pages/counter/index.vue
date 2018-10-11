<template>
  <div class="counter-warp">
    <p>Vuex counter：{{ count }}</p>
    <p>
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
    </p>

    <a href="/pages/index/index"
       class="home">去往首页</a>
  </div>
</template>

<script>
  // Use Vuex
  import { mapState, mapMutations } from 'vuex'

  export default {
    computed: {
      // count () {
      //   return this.$store.state.count
      // }
      ...mapState([
        'count'
      ])
    },
    methods: {
      // increment () {
      //   this.$store.commit('increment')
      // },
      // decrement () {
      //   this.$store.commit('decrement')
      // }
      ...mapMutations(['increment', 'decrement'])
    }
  }
</script>

<style>
  .counter-warp {
    margin-top: 100px;
    text-align: center;
  }
  .home {
    display: inline-block;
    margin: 100px auto;
    padding: 5px 10px;
    border: 1px solid blue;
    color: blue;
  }
</style>
