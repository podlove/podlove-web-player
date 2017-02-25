<template>
  <div class="podlove-player--timer" :class="playstate" :style="timerStyle(theme)">
    <span class="podlove-player--timer--current">{{secondsToTime(playtime)}}</span>
    <CurrentChapter class="podlove-player--timer--chapter" />
    <a href="javascript:void(0)" class="podlove-player--timer--time" @click="toggleTimerMode">
      <span v-if="timerMode === 'duration'">{{secondsToTime(duration)}}</span>
      <span v-else>-{{secondsToTime(duration - playtime)}}</span>
    </a>
  </div>
</template>

<script>
import store from 'store';
import { secondsToTime } from 'utils/time'
import CurrentChapter from './chapters/CurrentChapter.vue'

const timerStyle = theme => ({
  color: theme.player.timer.text
})

const toggleTimerMode = () => {
  store.dispatch(store.actions.toggleTimerMode())
}

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
    timerStyle,
    toggleTimerMode
  },
  components: {
    CurrentChapter,
  }
}
</script>

<style lang="scss">
  @import 'variables';
  @import 'font';

  $timer-width: 80px;

  // Timer
  .podlove-player--timer {
    display: flex;
    width: 100%;
    justify-content: space-between;
    font-weight: 100;
    font-size: 13px;
    overflow: hidden;
    height: 20px;
    transition: height $animation-duration;

    &.start, &.idle {
      height: 0;
    }
  }

  .podlove-player--timer--current {
    display: block;
    width: $timer-width;
    text-align: left;
    @include font-monospace();
  }

  .podlove-player--timer--chapter {
    text-align: center;
    width: calc(100% - #{$timer-width * 2});
    margin: 0 $margin / 2;
  }

  .podlove-player--timer--time {
    display: block;
    width: $timer-width;
    text-align: right;
    @include font-monospace();
  }
</style>
