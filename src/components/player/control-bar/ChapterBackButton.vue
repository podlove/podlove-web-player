<template>
  <button class="control-button" @click="onButtonClick()" :disabled="playtime === 0">
    <chapter-back-icon :color="theme.player.actions.background"></chapter-back-icon>
  </button>
</template>

<script>
  import { currentChapter, currentChapterIndex } from 'utils/chapters'

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
