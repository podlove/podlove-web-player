<template>
  <PodloveButton class="podlove-player--player-control podlove-player--chapter-control" :class="playstate" :click="onButtonClick">
    <ChapterBackIcon :color="theme.player.actions.background" />
  </PodloveButton>
</template>

<script>
  import { currentChapterIndex } from 'utils/chapters'

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
        const current = currentChapterIndex(chapters)

        let previous;
                  console.log((playtime - chapters[current].start))
        switch (true) {
          case current <= 0:
            previous = chapters[0]
          break

          case (playtime - chapters[current].start) <= 2:
            previous = chapters[current - 1]
          break

          default:
            previous = chapters[current]
        }

        store.dispatch(store.actions.updatePlaytime(previous.start))
      }
    }
  }
</script>
