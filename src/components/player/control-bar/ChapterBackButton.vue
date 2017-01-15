<template>
  <button class="podlove-player--button podlove-player--player-control podlove-player--chapter-control" :class="playstate" @click="onButtonClick" :disabled="isDisabled(chapters)">
    <Icon :color="theme.tertiary ? theme.primary : theme.secondary" />
  </button>
</template>

<script>
  import findIndex from 'lodash/findIndex'

  import store from 'store'
  import Icon from '../../icons/ChapterBackIcon.vue'

  const currentChapter = chapters =>
    findIndex(chapters, {active: true})

  const isDisabled = chapters =>
    currentChapter(chapters) <= 0

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
        const current = currentChapter(chapters)

        if (current <= 0) {
          return
        }

        store.dispatch(store.actions.updatePlaytime(chapters[current - 1].start))
      },
      isDisabled
    }
  }
</script>
