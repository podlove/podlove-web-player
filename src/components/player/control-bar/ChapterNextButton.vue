<template>
  <button class="control-button" @click="onButtonClick()" :disabled="isDisabled" id="control-bar--chapter-next-button">
    <chapter-next-icon :color="theme.player.actions.background" aria-hidden="true"></chapter-next-icon>
    <span class="visually-hidden">{{ a11y }}</span>
  </button>
</template>

<script>
  import { mapState, mapActions } from 'redux-vuex'
  import selectors from 'store/selectors'

  import ChapterNextIcon from 'icons/ChapterNextIcon'

  export default {
    components: {
      ChapterNextIcon
    },
    data: mapState({
      chapters: selectors.selectChapters,
      currentChapter: selectors.selectCurrentChapter,
      nextChapter: selectors.selectNextChapter,
      theme: 'theme',
      playtime: 'playtime',
      duration: 'duration'
    }),
    computed: {
      a11y () {
        if (this.currentChapter.index === this.chapters.length) {
          return this.$t('A11Y.PLAYER_CHAPTER_END')
        }

        return this.$t('A11Y.PLAYER_CHAPTER_NEXT', this.nextChapter)
      },
      isDisabled () {
        return this.playtime === this.duration
      }
    },
    methods: mapActions({
      onButtonClick: 'nextChapter'
    })
  }
</script>
