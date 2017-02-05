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
import CurrentChapter from './chapters/Current.vue'

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

  // Timer
  .podlove-player--timer {
    display: block;
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-weight: 100;
    font-size: 0.8rem;
    overflow: hidden;
    height: 1.2rem;
    transition: height $animation-duration;

    &.start, &.idle {
      height: 0;
    }
  }

  .podlove-player--timer--current {
    display: block;
    text-align: left;
    width: 20%;
    @include font-monospace();
  }

  .podlove-player--timer--chapter {
    text-align: center;
    width: 80%;
  }

  .podlove-player--timer--time {
    display: block;
    text-align: right;
    width: 20%;
    @include font-monospace();
  }

</style>

