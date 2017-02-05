<template>
  <div class="podlove-player" :class="playstate" :style="playerStyle(theme)">
    <div class="podlove-player--control">
      <div class="podlove-player--download"></div>
      <ControlBar class="podlove-player--control-bar"/>
      <div class="podlove-player--share"><ShareButton /></div>
    </div>
    <ProgressBar />
    <Timer />
  </div>
</template>

<script>
  import ControlBar from './control-bar/ControlBar.vue'
  import ProgressBar from './ProgressBar.vue'
  import Timer from './Timer.vue'

  import ShareButton from '../overlays/share/ShareButton.vue'

  const playerStyle = theme => ({
    'background-color': theme.player.background
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
      ShareButton,
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

  .podlove-player--control {
    width: 100%;
    display: flex;
    margin-bottom: $margin;

    .podlove-player--download, .podlove-player--share {
      width: 10%;
      display: flex;
      justify-content: center;
    }

    .podlove-player--download {
      align-items: left;
    }

    .podlove-player--share {
      align-items: right;
    }

    .podlove-player--control-bar {
      width: 80%;
    }
  }
</style>
