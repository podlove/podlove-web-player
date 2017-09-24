<template>
  <div class="control-bar centered">
    <transition name="button">
      <ChapterBackButton v-if="components.controls.chapters && visibleComponents.controlChapters"></ChapterBackButton>
    </transition>
    <transition name="button">
      <StepBackButton v-if="components.controls.steppers && visibleComponents.controlSteppers"></StepBackButton>
    </transition>
    <transition name="button">
      <PlayButton></PlayButton>
    </transition>
    <transition name="button">
      <StepForwardButton v-if="components.controls.steppers && visibleComponents.controlSteppers"></StepForwardButton>
    </transition>
    <transition name="button">
      <ChapterNextButton v-if="components.controls.chapters && visibleComponents.controlChapters"></ChapterNextButton>
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
    data () {
      return {
        chapters: this.$select('chapters'),
        components: this.$select('components'),
        visibleComponents: this.$select('visibleComponents')
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
  @import '~styles/variables';

  .control-bar {
    width: 100%;

    .control-button {
      margin: 0 $margin;
    }

    @media screen and (max-width: $width-s) {
      .control-button {
        margin: 0 ($margin / 2);
      }
    }
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
