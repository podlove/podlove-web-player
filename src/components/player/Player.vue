<template>
  <div class="podlove-player" :class="playstate" :style="playerStyle">
    <ControlBar />
    <ProgressBar />
    <Timer />
  </div>
</template>

<script>
  import ControlBar from './control-bar/ControlBar.vue'
  import ProgressBar from './ProgressBar.vue'
  import Timer from './Timer.vue'

  export default {
    data() {
      return {
        playstate: this.$select('playstate'),
        playerStyle: {
          'background-color': this.$select('theme.primary')
        }
      }
    },
    components: {
      ControlBar,
      ProgressBar,
      Timer
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'themes/ocean';

  .podlove-player {
    width: 100%;
    padding: $padding;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    &.start, &.idle {
      padding-bottom: 0;
    }
  }
</style>
