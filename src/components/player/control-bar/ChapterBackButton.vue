<template>
  <button class="control-button" @click="onButtonClick()" :disabled="isDisabled" id="control-bar--chapter-back-button">
    <chapter-back-icon :color="theme.player.actions.background" aria-hidden="true"></chapter-back-icon>
    <span class="visually-hidden">{{ a11y }}</span>
  </button>
</template>

<script>
  import { mapState, mapActions } from 'redux-vuex'
  import { selectPreviousChapter, selectCurrentChapter } from 'store/selectors'

  import ChapterBackIcon from 'icons/ChapterBackIcon'

  export default {
    components: {
      ChapterBackIcon
    },
    data: mapState({
      chapters: 'chapters',
      previousChapter: selectPreviousChapter,
      currentChapter: selectCurrentChapter,
      theme: 'theme',
      playtime: 'playtime'
    }),
    computed: {
      a11y () {
        if (this.currentChapter.index === 1) {
          return this.$t('A11Y.PLAYER_CHAPTER_CURRENT', this.currentChapter)
        }

        if (this.playtime - this.currentChapter.start < 2000) {
          return this.$t('A11Y.PLAYER_CHAPTER_PREVIOUS', this.previousChapter)
        }

        return this.$t('A11Y.PLAYER_CHAPTER_CURRENT', this.currentChapter)
      },

      isDisabled () {
        return this.playtime === 0
      }
    },
    methods: mapActions({
      onButtonClick: 'previousChapter'
    })
  }
</script>
