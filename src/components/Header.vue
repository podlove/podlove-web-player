<template>
  <div class="podlove-header">
    <img class="podlove-header--poster" :src="poster" />
    <div class="podlover-header--info">
      <h1 class="podlove-header--title">{{title}}</h1>
      <div class="podlove-header--subtitle">{{subtitle}}</div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        poster: this.$select('poster'),
        title: this.$select('title'),
        subtitle: this.$select('subtitle')
      }
    }
  }
</script>
