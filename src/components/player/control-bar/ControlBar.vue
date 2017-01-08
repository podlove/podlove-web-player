<template>
  <div class="podlove-player--control-bar">
    <StepBackButton />
    <PlayButton />
    <StepForwardButton />
  </div>
</template>

<script>
  import PlayButton from './PlayButton.vue'
  import StepBackButton from './StepBackButton.vue'
  import StepForwardButton from './StepForwardButton.vue'

  export default {
    name: 'ControlBar',
    data () {
      return {
        running: this.$select('running'),
        playstate: this.$select('playstate')
      }
    },
    components: {
      PlayButton,
      StepBackButton,
      StepForwardButton
    }
  }
</script>

<style lang="scss">
  @import '../../../styles/variables';

  .podlove-player--control-bar {
    width: 100%;
    margin-bottom: $margin;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .podlove-player--button {
    cursor: pointer;

    background: transparent;

    border-radius: 0;
    border: 0;
    opacity: 1;
    transition: opacity $animation-duration;

    &[disabled] {
      opacity: 0.5;
    }

    &.start, &.idle, &.end {
      opacity: 0;
    }
  }
</style>
