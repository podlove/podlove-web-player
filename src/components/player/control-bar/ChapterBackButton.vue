<template>
  <button class="control-button" @click="onButtonClick()" :disabled="isDisabled" id="control-bar--chapter-back-button">
    <chapter-back-icon :color="theme.player.actions.background" aria-hidden="true"></chapter-back-icon>
    <span class="visually-hidden">{{ a11y }}</span>
  </button>
</template>

<script>
  import { currentChapter, currentChapterIndex, previousChapter } from 'utils/chapters'

  import store from 'store'
  import ChapterBackIcon from 'icons/ChapterBackIcon'

  export default {
    components: {
      ChapterBackIcon
    },
    data () {
      return {
        chapters: this.$select('chapters'),
        theme: this.$select('theme'),
        playtime: this.$select('playtime')
      }
    },
    computed: {
      a11y () {
        const chapter = currentChapter(this.chapters)

        if (chapter.index === 1) {
          return this.$t('A11Y.PLAYER_CHAPTER_CURRENT', { ...chapter })
        }

        if (this.playtime - chapter.start < 2000) {
          return this.$t('A11Y.PLAYER_CHAPTER_PREVIOUS', { ...previousChapter(this.chapters) })
        }

        return this.$t('A11Y.PLAYER_CHAPTER_CURRENT', { ...chapter })
      },

      isDisabled () {
        return this.playtime === 0
      }
    },
    methods: {
      onButtonClick () {
        const current = currentChapter(this.chapters)
        const currentIndex = currentChapterIndex(this.chapters)

        if (this.playtime - current.start <= 2) {
          store.dispatch(store.actions.previousChapter())
        } else {
          store.dispatch(store.actions.setChapter(currentIndex))
        }
      }
    }
  }
</script>
