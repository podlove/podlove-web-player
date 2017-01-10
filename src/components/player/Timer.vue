<template>
  <div class="podlove-player--timer" :class="playstate">
    <span class="podlove-player--timer--current">{{secondsToTime(playtime)}}</span>
    <span class="podlove-player--timer--duration">{{secondsToTime(duration)}}</span>
  </div>
</template>

<script>
import { secondsToTime } from 'utils/time'

export default {
  data() {
    return {
      playtime:   this.$select('playtime'),
      duration:   this.$select('duration'),
      playstate:  this.$select('playstate')
    }
  },
  methods: {
    secondsToTime
  }
}
</script>

<style lang="scss">
  @import 'variables';
  @import 'themes/ocean';

  // Timer
  .podlove-player--timer {
    display: block;
    width: 100%;
    display: flex;
    justify-content: space-between;
    color: $secondary-color;
    font-weight: 100;
    font-size: 0.8rem;
    overflow: hidden;
    height: 15px;
    transition: height $animation-duration;

    &.start, &.idle {
      height: 0;
    }
  }
</style>

