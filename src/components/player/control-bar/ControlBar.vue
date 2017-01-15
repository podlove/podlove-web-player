<template>
  <div class="podlove-player--control-bar">
    <ChapterBackButton />
    <StepBackButton />

    <PlayButton />

    <StepForwardButton />
    <ChapterNextButton />
  </div>
</template>

<script>
  import PlayButton from './PlayButton.vue'
  import StepBackButton from './StepBackButton.vue'
  import StepForwardButton from './StepForwardButton.vue'
  import ChapterNextButton from './ChapterNextButton.vue'
  import ChapterBackButton from './ChapterBackButton.vue'

  export default {
    components: {
      PlayButton,
      StepBackButton,
      StepForwardButton,
      ChapterNextButton,
      ChapterBackButton
    }
  }
</script>

<style lang="scss">
  @import 'variables';

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

  .podlove-player--player-control {
    margin: 0 ($margin / 1.5);
  }

  @media screen and (max-width: $width-xs) {
    .podlove-player--chapter-control {
      display: none;
    }
  }
</style>
