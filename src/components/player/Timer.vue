<template>
  <div class="podlove-player--timer" :class="playstate" :style="timerStyle(theme)">
    <span class="current">{{secondsToTime(playtime)}}</span>
    <CurrentChapter class="chapter" />
    <span class="time">{{secondsToTime(duration - playtime)}}</span>
  </div>
</template>

<script>
import store from 'store';
import color from 'color'

import { secondsToTime } from 'utils/time'
import CurrentChapter from './chapters/CurrentChapter.vue'

const timerStyle = theme => ({
  color: color(theme.player.timer.text).fade(0.5)
})

export default {
  data() {
    return {
      playtime:   this.$select('playtime'),
      duration:   this.$select('duration'),
      playstate:  this.$select('playstate'),
      theme:      this.$select('theme'),
      chapters:   this.$select('chapters'),
      timerMode:  this.$select('timerMode')
    }
  },
  methods: {
    secondsToTime,
    timerStyle
  },
  components: {
    CurrentChapter
  }
}
</script>

<style lang="scss">
  @import 'variables';
  @import 'font';

  $timer-width: 80px;
  $timer-height: 20px;

  // Timer
  .podlove-player--timer {
    display: flex;
    width: 100%;
    justify-content: space-between;
    overflow: hidden;
    transition: height $animation-duration;
    margin-top: -1em;
    height: 20px;

    &.start, &.idle {
      margin-top: 0;
      height: 0;
    }

    .current {
      display: block;
      width: $timer-width;
      text-align: left;
      @include font-monospace();
    }

    .chapter {
      text-align: center;
      width: calc(100% - #{$timer-width * 2});
      margin: 0 $margin / 2;
    }

    .time {
      display: block;
      width: $timer-width;
      text-align: right;
      @include font-monospace();
    }
  }
</style>
