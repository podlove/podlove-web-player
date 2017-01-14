<template>
  <div class="podlove-player" :class="playstate" :style="playerStyle(theme)">
    <ControlBar />
    <ProgressBar />
    <Timer />
  </div>
</template>

<script>
  import ControlBar from './control-bar/ControlBar.vue'
  import ProgressBar from './ProgressBar.vue'
  import Timer from './Timer.vue'

  const playerStyle = theme => ({
    'background-color': theme.tertiary ? theme.secondary : theme.primary
  })

  export default {
    data() {
      return {
        playstate: this.$select('playstate'),
        theme: this.$select('theme')
      }
    },
    methods: {
      playerStyle
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
