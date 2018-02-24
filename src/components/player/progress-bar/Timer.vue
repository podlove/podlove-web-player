<template>
  <div class="timer-progress" :class="playstate" :style="timerStyle">
    <span class="current">{{ fromPlayerTime(ghost.active ? ghost.time : playtime) }}</span>
    <current-chapter class="chapter"></current-chapter>
    <span class="time">-{{ fromPlayerTime(duration - (ghost.active ? ghost.time : playtime)) }}</span>
  </div>
</template>

<script>
import color from 'color'

import { fromPlayerTime } from 'utils/time'
import CurrentChapter from './CurrentChapter'

export default {
  data () {
    return {
      playtime: this.$select('playtime'),
      ghost: this.$select('ghost'),
      duration: this.$select('duration'),
      playstate: this.$select('playstate'),
      theme: this.$select('theme'),
      chapters: this.$select('chapters')
    }
  },
  computed: {
    timerStyle () {
      return {
        color: color(this.theme.player.timer.text).fade(0.5)
      }
    }
  },
  methods: {
    fromPlayerTime
  },
  components: {
    CurrentChapter
  }
}
</script>

<style lang="scss">
  @import '~styles/variables';
  @import '~styles/font';

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
