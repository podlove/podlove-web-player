<template>
  <PodloveButton class="podlove-player--player-control podlove-player--chapter-control" :class="playstate" :click="onButtonClick" :disabled="isDisabled(chapters)">
    <ChapterBackIcon :color="theme.player.actions.background" />
  </PodloveButton>
</template>

<script>
  import { currentChapterIndex } from 'utils/chapters'

  import store from 'store'
  import PodloveButton from 'shared/Button.vue'
  import ChapterBackIcon from 'icons/ChapterBackIcon.vue'

  const isDisabled = chapters =>
    currentChapterIndex(chapters) <= 0

  export default {
    components: {
      PodloveButton,
      ChapterBackIcon
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

        if (current <= 0) {
          return
        }

        store.dispatch(store.actions.updatePlaytime(chapters[current - 1].start))
      },
      isDisabled
    }
  }
</script>
