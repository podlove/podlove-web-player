<template>
  <button class="control-button" @click="onButtonClick()" :disabled="isDisabled" id="control-bar--chapter-next-button">
    <chapter-next-icon :color="theme.player.actions.background" aria-hidden="true"></chapter-next-icon>
    <span class="visually-hidden">{{ a11y }}</span>
  </button>
</template>

<script>
  import store from 'store'
  import ChapterNextIcon from 'icons/ChapterNextIcon'

  import { nextChapter, currentChapter } from 'utils/chapters'

  export default {
    components: {
      ChapterNextIcon
    },
    data () {
      return {
        chapters: this.$select('chapters'),
        theme: this.$select('theme'),
        playtime: this.$select('playtime'),
        duration: this.$select('duration')
      }
    },
    computed: {
      a11y () {
        if (currentChapter(this.chapters).index === this.chapters.length) {
          return this.$t('A11Y.PLAYER_CHAPTER_END')
        }

        return this.$t('A11Y.PLAYER_CHAPTER_NEXT', { ...nextChapter(this.chapters) })
      },
      isDisabled () {
        return this.playtime === this.duration
      }
    },
    methods: {
      onButtonClick () {
        store.dispatch(store.actions.nextChapter())
      }
    }
  }
</script>
