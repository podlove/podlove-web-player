<template>
  <PodloveButton class="podlove-player--button podlove-player--player-control podlove-player--chapter-control" :class="playstate" :click="onButtonClick" :disabled="isDisabled(chapters)">
    <ChapterNextIcon :color="theme.player.actions.background" />
  </PodloveButton>
</template>

<script>
  import { currentChapterIndex } from 'utils/chapters'

  import store from 'store'
  import PodloveButton from 'shared/Button.vue'
  import ChapterNextIcon from 'icons/ChapterNextIcon.vue'

  const isDisabled = chapters =>
    currentChapterIndex(chapters) === (chapters.length - 1)

  export default {
    components: {
      PodloveButton,
      ChapterNextIcon
    },
    data () {
      return {
        chapters: this.$select('chapters'),
        theme: this.$select('theme'),
        playstate: this.$select('playstate')
      }
    },
    methods: {
      onButtonClick () {
        const chapters = this.$select('chapters')
        const current = currentChapterIndex(chapters)

        if (current === -1 || current === chapters.length -1) {
          return
        }

        store.dispatch(store.actions.updatePlaytime(chapters[current + 1].start))
      },
      isDisabled
    }
  }
</script>
