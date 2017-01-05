<template>
  <div class="podlove-player--control-bar">
    <StepBackButton />
    <PlayButton v-if="!running"/>
    <PauseButton v-if="running"/>
    <StepForwardButton />
  </div>
</template>

<script>
  import PlayButton from './PlayButton.vue'
  import PauseButton from './PauseButton.vue'
  import StepBackButton from './StepBackButton.vue'
  import StepForwardButton from './StepForwardButton.vue'

  export default {
    name: 'ControlBar',
    data () {
      return {
        running: this.$select('running')
      }
    },
    components: {
      PlayButton,
      PauseButton,
      StepBackButton,
      StepForwardButton
    }
  }
</script>

<style lang="scss">
  @import '../../styles/variables';

  .podlove-player--control-bar {
    width: 100%;
    margin-bottom: $margin;

    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
