<template>
  <button class="control-button" @click="onButtonClick()" :disabled="playtime === duration" id="control-bar--chapter-next-button">
    <chapter-next-icon :color="theme.player.actions.background"></chapter-next-icon>
  </button>
</template>

<script>
  import store from 'store'
  import ChapterNextIcon from 'icons/ChapterNextIcon'

  export default {
    components: {
      ChapterNextIcon
    },
    data () {
      return {
        chapters: this.$select('chapters'),
        theme: this.$select('theme'),
        playtime: this.$select('playtime'),
        duration: this.$select('duration')
      }
    },
    methods: {
      onButtonClick () {
        store.dispatch(store.actions.nextChapter())
      }
    }
  }
</script>
