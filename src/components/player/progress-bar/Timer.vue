<template>
  <div class="timer-progress" :class="playstate" :style="timerStyle">
    <span class="current" id="progress-bar--timer-current" :aria-label="a11y.current" tabindex="0">{{ fromPlayerTime(ghost.active ? ghost.time : playtime) }}</span>
    <current-chapter class="chapter"></current-chapter>
    <span class="time" id="progress-bar--timer-left" :aria-label="a11y.left" tabindex="0">-{{ fromPlayerTime(duration - (ghost.active ? ghost.time : playtime)) }}</span>
  </div>
</template>

<script>
import color from 'color'
import { mapState } from 'redux-vuex'

import { fromPlayerTime, calcHours, calcMinutes, calcSeconds } from 'utils/time'
import CurrentChapter from './CurrentChapter'

export default {
  data: mapState('playtime', 'ghost', 'duration', 'playstate', 'theme', 'chapters'),
  computed: {
    timerStyle () {
      return {
        color: color(this.theme.player.timer.text).fade(0.5)
      }
    },
    a11y () {
      return {
        current: this.$t('A11Y.TIMER_CURRENT', { hours: calcHours(this.playtime), minutes: calcMinutes(this.playtime), seconds: calcSeconds(this.playtime) }),
        left: this.$t('A11Y.TIMER_LEFT', { hours: calcHours(this.duration - this.playtime), minutes: calcMinutes(this.duration - this.playtime), seconds: calcSeconds(this.duration - this.playtime) })
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
