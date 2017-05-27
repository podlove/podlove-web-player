<template>
  <div class="control-bar">
    <transition name="button">
      <ChapterBackButton v-if="components.controls.chapters && chapters.length > 0" />
    </transition>
    <transition name="button">
      <StepBackButton v-if="components.controls.steppers" />
    </transition>
    <transition name="button">
      <PlayButton v-if="components.controls.button.visible" />
    </transition>
    <transition name="button">
      <StepForwardButton v-if="components.controls.steppers" />
    </transition>
    <transition name="button">
      <ChapterNextButton v-if="components.controls.chapters && chapters.length > 0" />
    </transition>
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
        chapters: this.$select('chapters'),
        components: this.$select('components')
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

  .control-bar {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .player-control {
    margin: 0 ($margin / 1.5);
  }

  @media screen and (max-width: $width-xs) {
    .chapter-control {
      display: none;
    }
  }
</style>
