<template>
  <div class="podlove-chapters" :style="chapterStyle(theme)">
    <ChapterEntry v-for="(chapter, index) in chapters" :chapter="chapter" :index="index"/>
  </div>
</template>

<script>
  import ChapterEntry from './Entry.vue'

  const chapterStyle = theme => ({
    'background-color': theme.secondary,
  })

  export default {
    data() {
      return {
        theme: this.$select('theme'),
        chapters: this.$select('chapters')
      }
    },
    methods: {
      chapterStyle
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
