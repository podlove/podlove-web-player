<template>
  <div class="podlove-player--timer" :class="playstate" :style="timerStyle(theme)">
    <span class="podlove-player--timer--current">{{secondsToTime(playtime)}}</span>
    <span class="podlove-player--timer--chapter" v-if="currentChapterIndex(chapters) > -1">{{chapterTitle(chapters)}}</span>
    <span class="podlove-player--timer--duration">{{secondsToTime(duration)}}</span>
  </div>
</template>

<script>
import get from 'lodash/get'

import { secondsToTime } from 'utils/time'
import { currentChapter, currentChapterIndex } from 'utils/chapters'

const timerStyle = theme => ({
  color: theme.tertiary ? theme.tertiary : theme.secondary
})

const chapterTitle = chapters => {
  const current = currentChapter(chapters)
  const index = currentChapterIndex(chapters)
  return `Kapitel ${index + 1}: ${get(current, 'title', '')}`
}

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
    timerStyle,
    chapterTitle,
    currentChapterIndex
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

