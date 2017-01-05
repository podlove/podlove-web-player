<template>
  <div class="podlove-player">
    <ControlBar />
    <ProgressBar />
    <Timer />
  </div>
</template>

<script>
  import ControlBar from './player/ControlBar.vue'
  import ProgressBar from './player/ProgressBar.vue'
  import Timer from './player/Timer.vue'

  export default {
    components: {
      ControlBar,
      ProgressBar,
      Timer
    }
  }
</script>

<style lang="scss">
  @import '../styles/variables';
  @import '../styles/themes/ocean';

  .podlove-player {
    width: 100%;
    padding: $padding;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    background-color: $primary-color;

    .podlove-player--button {
      cursor: pointer;

      background: transparent;

      border-radius: 0;
      border: 0;

      &[disabled] {
        opacity: 0.5;
      }
    }
}

</style>

          <!--<ProgressBar />
          <Timer />-->
