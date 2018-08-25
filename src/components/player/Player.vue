<template>
  <div class="player" :style="backgroundStyle">
    <control-bar></control-bar>
    <transition name="progressbar">
      <progress-bar v-if="components.progressbar && visibleComponents.progressbar"></progress-bar>
    </transition>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'

  import ControlBar from './control-bar/ControlBar'
  import ProgressBar from './progress-bar/ProgressBar'

  export default {
    data: mapState('playstate', 'reference', 'theme', 'visibleComponents', 'components'),
    computed: {
      backgroundStyle () {
        return {
          'background-color': this.theme.player.background
        }
      }
    },
    components: {
      ControlBar,
      ProgressBar
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .player {
    width: 100%;
    padding: $padding;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
</style>
