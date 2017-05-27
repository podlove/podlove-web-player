<template>
  <ButtonComponent class="chapter-control" :click="onButtonClick">
    <ChapterBackIcon :color="theme.player.actions.background" />
  </ButtonComponent>
</template>

<script>
  import { previousChapterPlaytime } from 'utils/chapters'

  import store from 'store'
  import ButtonComponent from 'shared/Button.vue'
  import ChapterBackIcon from 'icons/ChapterBackIcon.vue'

  export default {
    components: {
      ButtonComponent,
      ChapterBackIcon
    },
    data () {
      return {
        chapters: this.$select('chapters'),
        theme: this.$select('theme')
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
