<template>
  <div class="podlove-player--control-bar">
    <ChapterBackButton class="podlove-player--chapter-control" v-if="chapters.length > 0"/>
    <StepBackButton />

    <PlayButton />

    <StepForwardButton />
    <ChapterNextButton class="podlove-player--chapter-control" v-if="chapters.length > 0"/>
  </div>
</template>

<script>
  import PlayButton from './PlayButton.vue'
  import StepBackButton from './StepBackButton.vue'
  import StepForwardButton from './StepForwardButton.vue'
  import ChapterNextButton from './ChapterNextButton.vue'
  import ChapterBackButton from './ChapterBackButton.vue'

  export default {
    data() {
      return {
        chapters: this.$select('chapters')
      }
    },
    components: {
      PlayButton,
      StepBackButton,
      StepForwardButton,
      ChapterNextButton,
      ChapterBackButton
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  .podlove-player--control-bar {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .podlove-player--player-control {
    margin: 0 ($margin / 1.5);
  }

  @media screen and (max-width: $width-xs) {
    .podlove-player--chapter-control {
      display: none;
    }
  }
</style>
