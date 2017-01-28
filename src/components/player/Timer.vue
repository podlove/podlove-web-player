<template>
  <div class="podlove-player--timer" :class="playstate" :style="timerStyle(theme)">
    <span class="podlove-player--timer--current">{{secondsToTime(playtime)}}</span>
    <CurrentChapter class="podlove-player--timer--chapter" />
    <span class="podlove-player--timer--duration">{{secondsToTime(duration)}}</span>
  </div>
</template>

<script>
import { secondsToTime } from 'utils/time'
import CurrentChapter from './chapters/Current.vue'

const timerStyle = theme => ({
  color: theme.player.timer.text
})

export default {
  data() {
    return {
      playtime:   this.$select('playtime'),
      duration:   this.$select('duration'),
      playstate:  this.$select('playstate'),
      theme:      this.$select('theme'),
      chapters:   this.$select('chapters')
    }
  },
  methods: {
    secondsToTime,
    timerStyle
  },
  components: {
    CurrentChapter,
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
    height: 1rem;
    transition: height $animation-duration;

    &.start, &.idle, &.end {
      height: 0;
    }
  }

  .podlove-player--timer--current {
    text-align: left;
    width: 20%;
  }

  .podlove-player--timer--chapter {
    text-align: center;
    width: 80%;
  }

  .podlove-player--timer--duration {
    text-align: right;
    width: 20%;
  }

</style>

