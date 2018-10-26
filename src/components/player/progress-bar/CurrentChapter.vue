<template>
  <div class="timer-chapter truncate" id="progress-bar--current-chapter">
    <span class="chapter-title" :aria-label="a11y" tabindex="0"
      :style="chapterStyle"
      v-if="title">
        {{ title }}
    </span>
  </div>
</template>

<script>
  import { get } from 'lodash'
  import { mapState } from 'redux-vuex'
  import { selectChapters, selectCurrentChapter } from 'store/selectors'

  import { currentChapterByPlaytime } from 'utils/chapters'

  export default {
    data: mapState({
      chapters: selectChapters,
      currentChapter: selectCurrentChapter,
      ghost: 'ghost',
      theme: 'theme'
    }),
    computed: {
      chapterStyle () {
        return {
          color: this.theme.player.timer.chapter
        }
      },

      title () {
        if (!this.ghost.active) {
          return get(this.currentChapter, 'title', '')
        }

        return get(currentChapterByPlaytime(this.chapters)(this.ghost.time), 'title', '')
      },

      a11y () {
        return this.$t('A11Y.TIMER_CHAPTER', this.chapter)
      }
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
