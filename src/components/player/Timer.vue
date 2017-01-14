<template>
  <div class="podlove-player--timer" :class="playstate" :style="timerStyle(theme)">
    <span class="podlove-player--timer--current">{{secondsToTime(playtime)}}</span>
    <span class="podlove-player--timer--duration">{{secondsToTime(duration)}}</span>
  </div>
</template>

<script>
import { secondsToTime } from 'utils/time'

const timerStyle = theme => ({
  color: theme.tertiary ? theme.tertiary : theme.secondary
})

export default {
  data() {
    return {
      playtime:   this.$select('playtime'),
      duration:   this.$select('duration'),
      playstate:  this.$select('playstate'),
      theme:      this.$select('theme')
    }
  },
  methods: {
    secondsToTime,
    timerStyle
  }
}
</script>

<style lang="scss">
  @import 'variables';

  // Timer
  .podlove-player--timer {
    display: block;
    width: 100%;
    display: flex;
    justify-content: space-between;
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

