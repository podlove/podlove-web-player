<template>
  <PodloveButton class="podlove-player--player-control podlove-player--chapter-control" :class="playstate" :click="onButtonClick">
    <ChapterNextIcon :color="theme.player.actions.background" />
  </PodloveButton>
</template>

<script>
  import { nextChapterPlaytime } from 'utils/chapters'

  import store from 'store'
  import PodloveButton from 'shared/Button.vue'
  import ChapterNextIcon from 'icons/ChapterNextIcon.vue'

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
        const duration = this.$select('duration')
        const nextChapter = nextChapterPlaytime(chapters)

        store.dispatch(store.actions.updatePlaytime(nextChapter || duration))
      }
    }
  }
</script>
