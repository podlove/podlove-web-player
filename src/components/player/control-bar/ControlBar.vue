<template>
  <div class="control-bar centered">
    <transition name="button">
      <chapter-back-button v-if="components.controls.chapters && visibleComponents.controlChapters"></chapter-back-button>
    </transition>
    <transition name="button">
      <step-back-button v-if="components.controls.steppers && visibleComponents.controlSteppers"></step-back-button>
    </transition>
    <transition name="button">
      <PlayButton></PlayButton>
    </transition>
    <transition name="button">
      <step-forward-button v-if="components.controls.steppers && visibleComponents.controlSteppers"></step-forward-button>
    </transition>
    <transition name="button">
      <chapter-next-button v-if="components.controls.chapters && visibleComponents.controlChapters"></chapter-next-button>
    </transition>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'

  import PlayButton from './PlayButton'
  import StepBackButton from './StepBackButton'
  import StepForwardButton from './StepForwardButton'
  import ChapterNextButton from './ChapterNextButton'
  import ChapterBackButton from './ChapterBackButton'

  export default {
    data: mapState('chapters', 'components', 'visibleComponents'),
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
      opacity: 1;

      &:hover {
        opacity: 0.8;
      }
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
