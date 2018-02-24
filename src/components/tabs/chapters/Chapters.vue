<template>
  <div class="chapters-tab">
    <chapter-entry-component
      v-for="(chapter, index) in chapters"
      :chapter="chapter"
      :index="index"
      :key="index">
    </chapter-entry-component>
  </div>
</template>

<script>
  import ChapterEntryComponent from './ChapterEntry'

  export default {
    data () {
      return {
        theme: this.$select('theme'),
        chapters: this.$select('chapters')
      }
    },
    components: {
      ChapterEntryComponent
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .chapters-tab {
    width: 100%;
    padding: $padding 0;
  }
</style>
