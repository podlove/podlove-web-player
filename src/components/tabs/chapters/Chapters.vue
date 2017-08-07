<template>
  <div class="chapters-tab">
    <ChapterEntryComponent
      v-for="(chapter, index) in chapters"
      :chapter="chapter"
      :index="index"
      :key="index">
    </ChapterEntryComponent>
  </div>
</template>

<script>
  import ChapterEntryComponent from './ChapterEntry.vue'

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
