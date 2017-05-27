<template>
  <div class="timer-progress" :class="playstate" :style="timerStyle(theme)">
    <span class="current">{{secondsToTime(playtime)}}</span>
    <CurrentChapter class="chapter" />
    <span class="time">{{secondsToTime(duration - playtime)}}</span>
  </div>
</template>

<script>
import store from 'store';
import color from 'color'

import { secondsToTime } from 'utils/time'
import CurrentChapter from './CurrentChapter.vue'

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
  .timer-progress {
    display: flex;
    width: 100%;
    justify-content: space-between;
    overflow: hidden;
    transition: height $animation-duration;
    margin-top: -1em;
    height: $timer-height;

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
