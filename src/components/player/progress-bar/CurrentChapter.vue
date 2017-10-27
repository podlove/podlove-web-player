<template>
  <div class="timer-chapter truncate">
    <span class="chapter-title"
      :style="chapterStyle"
      v-if="currentChapterIndex(chapters) > -1">
        {{chapterTitle}}
    </span>
  </div>
</template>

<script>
  import get from 'lodash/get'
  import { currentChapter, currentChapterIndex, currentChapterByPlaytime } from 'utils/chapters'

  export default {
    data () {
      return {
        chapters: this.$select('chapters'),
        ghost: this.$select('ghost'),
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
        let current

        if (!this.ghost.active) {
          current = currentChapter(this.chapters)
        } else {
          current = currentChapterByPlaytime(this.chapters)(this.ghost.time)
        }

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
