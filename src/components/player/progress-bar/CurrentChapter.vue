<template>
  <div class="timer-chapter truncate">
    <span class="chapter-title" v-marquee
      :style="chapterStyle"
      v-if="currentChapterIndex(chapters) > -1">
        {{chapterTitle}}
    </span>
  </div>
</template>

<script>
  import get from 'lodash/get'
  import { currentChapter, currentChapterIndex } from 'utils/chapters'

  export default {
    data () {
      return {
        chapters: this.$select('chapters'),
        theme: this.$select('theme')
      }
    },
    computed: {
      chapterStyle () {
        return {
          color: this.theme.player.timer.chapter
        }
      },

      chapterTitle () {
        const current = currentChapter(this.chapters)
        return get(current, 'title', '')
      }
    },
    methods: {
      currentChapterIndex
    }
  }
</script>

<style lang="scss">
  .timer-chapter {
    width: 100%;
    text-align: center;

    .chapter-title {
      white-space: nowrap;
      display: inline-block;
    }
  }
</style>
