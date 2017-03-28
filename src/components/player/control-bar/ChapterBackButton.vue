<template>
  <PodloveButton class="podlove-player--player-control podlove-player--chapter-control" :class="playstate" :click="onButtonClick">
    <ChapterBackIcon :color="theme.player.actions.background" />
  </PodloveButton>
</template>

<script>
  import { previousChapterPlaytime } from 'utils/chapters'

  import store from 'store'
  import PodloveButton from 'shared/Button.vue'
  import ChapterBackIcon from 'icons/ChapterBackIcon.vue'

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
        const playtime = this.$select('playtime')
        const previousChapter = previousChapterPlaytime(chapters, playtime)

        store.dispatch(store.actions.updatePlaytime(previousChapter || 0))
      }
    }
  }
</script>
