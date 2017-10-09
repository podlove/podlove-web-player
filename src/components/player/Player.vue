<template>
  <div class="player" :style="backgroundStyle">
    <ControlBar></ControlBar>
    <transition name="progressbar">
      <ProgressBar v-if="components.progressbar && visibleComponents.progressbar" />
    </transition>
  </div>
</template>

<script>
  import ControlBar from './control-bar/ControlBar.vue'
  import ProgressBar from './progress-bar/ProgressBar.vue'

  export default {
    data () {
      return {
        playstate: this.$select('playstate'),
        reference: this.$select('reference'),
        theme: this.$select('theme'),
        visibleComponents: this.$select('visibleComponents'),
        components: this.$select('components')
      }
    },
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
