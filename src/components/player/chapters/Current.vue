<template>
  <span
    class="podlove-player--timer--chapter-title"
    :style="chapterStyle(theme)"
    v-if="currentChapterIndex(chapters) > -1">
      {{chapterTitle(chapters)}}
  </span>
</template>

<script>
  import color from 'color'
  import get from 'lodash/get'
  import { currentChapter, currentChapterIndex } from 'utils/chapters'

  const chapterStyle = theme => ({
    color: color(theme.player.timer.chapter).fade(0.5)
  })

  const chapterTitle = chapters => {
    const current = currentChapter(chapters)
    return `${get(current, 'title', '')}`
  }

  export default {
    data() {
      return {
        chapters: this.$select('chapters'),
        theme: this.$select('theme')
      }
    },
    methods: {
      chapterStyle,
      chapterTitle,
      currentChapterIndex
    }
  }
</script>

<style lang="scss">
  .podlove-player--timer--chapter-title {
    width: 100%;
    text-align: center;
    font-style: italic;
    font-weigth: 100;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
