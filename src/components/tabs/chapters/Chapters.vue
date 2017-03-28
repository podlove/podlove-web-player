<template>
  <div class="podlove-chapters">
    <ChapterEntry v-for="(chapter, index) in chapters" :chapter="chapter" :index="index" :key="index"/>
  </div>
</template>

<script>
  import ChapterEntry from './ChapterEntry.vue'

  export default {
    data() {
      return {
        theme: this.$select('theme'),
        chapters: this.$select('chapters')
      }
    },
    components: {
      ChapterEntry
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  .podlove-chapters {
    width: 100%;
    padding: $padding 0;
  }
</style>
