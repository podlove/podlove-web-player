<template>
  <div class="player" :style="backgroundStyle(theme)">
    <ControlBar />
    <transition name="progressbar">
      <ProgressBar v-if="components.progressbar" />
    </transition>
  </div>
</template>

<script>
  import ControlBar from './control-bar/ControlBar.vue'
  import ProgressBar from './progress-bar/ProgressBar.vue'

  const backgroundStyle = theme => ({
    'background-color': theme.player.background
  })

  export default {
    data() {
      return {
        playstate: this.$select('playstate'),
        reference: this.$select('reference'),
        theme: this.$select('theme'),
        components: this.$select('components')
      }
    },
    components: {
      ControlBar,
      ProgressBar
    },
    methods: {
      backgroundStyle
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  .player {
    width: 100%;
    padding: $padding;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
</style>
