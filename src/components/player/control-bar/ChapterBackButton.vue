<template>
  <button class="podlove-player--button podlove-player--player-control podlove-player--chapter-control" :class="playstate" @click="onButtonClick" :disabled="isDisabled(chapters)">
    <Icon :color="theme.tertiary ? theme.primary : theme.secondary" />
  </button>
</template>

<script>
  import { currentChapterIndex } from 'utils/chapters'
  import store from 'store'
  import Icon from '../../icons/ChapterBackIcon.vue'

  const isDisabled = chapters =>
    currentChapterIndex(chapters) <= 0

  export default {
    components: {
      Icon
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
