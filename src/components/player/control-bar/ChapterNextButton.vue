<template>
  <ButtonComponent class="chapter-control" :click="onButtonClick">
    <ChapterNextIcon :color="theme.player.actions.background" />
  </ButtonComponent>
</template>

<script>
  import { nextChapterPlaytime } from 'utils/chapters'

  import store from 'store'
  import ButtonComponent from 'shared/Button.vue'
  import ChapterNextIcon from 'icons/ChapterNextIcon.vue'

  export default {
    components: {
      ButtonComponent,
      ChapterNextIcon
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
        const duration = this.$select('duration')
        const nextChapter = nextChapterPlaytime(chapters)

        store.dispatch(store.actions.updatePlaytime(nextChapter || duration))
      }
    }
  }
</script>
