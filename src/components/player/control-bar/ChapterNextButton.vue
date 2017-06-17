<template>
  <ButtonComponent class="chapter-control" :click="onButtonClick" :disabled="playtime === duration">
    <ChapterNextIcon :color="theme.player.actions.background" />
  </ButtonComponent>
</template>

<script>
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
