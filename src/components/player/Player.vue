<template>
  <div class="podlove-player" :style="backgroundStyle(theme)" :class="playstate">
    <div class="control" :class="playstate">
      <ControlBar class="control-bar"/>
    </div>
    <ProgressBar />
    <Timer />
  </div>
</template>

<script>
  import ControlBar from './control-bar/ControlBar.vue'
  import ProgressBar from './ProgressBar.vue'
  import Timer from './Timer.vue'

  const backgroundStyle = theme => ({
    'background-color': theme.player.background
  })

  export default {
    data() {
      return {
        playstate: this.$select('playstate'),
        reference: this.$select('reference'),
        theme: this.$select('theme')
      }
    },
    components: {
      ControlBar,
      ProgressBar,
      Timer
    },
    methods: {
      backgroundStyle
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

  .control {
    width: 100%;
    display: flex;

    &.start {
      margin-bottom: $margin;
    }
  }
</style>
