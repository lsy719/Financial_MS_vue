<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import Layout from './layout/Layout.vue'
export default {
  name: 'App',
  components: {
    Layout,
  }
}
</script>

<style scoped>
</style>
