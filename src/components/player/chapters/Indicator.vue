<template>
  <div class="podlove-player--chapters-progress">
    <span class="podlove-player--chapters-progress--indicator"
      v-for="(chapter, index) in chapters"
      :style="indicatorStyle(theme, chapter, duration)"
      :class="{ last: isLast(chapters, index) }"></span>
  </div>
</template>

<script>
  const indicatorStyle = (theme, chapter, duration) => ({
      left: ((chapter.end * 100) / duration) + '%',
      background: theme.player.progress.seperator
  })

  const isLast = (chapters, index) =>
    chapters.length - 1 === index

  export default {
    data() {
      return {
        chapters: this.$select('chapters'),
        theme: this.$select('theme'),
        duration: this.$select('duration')
      }
    },
    methods: {
      indicatorStyle,
      isLast
    }
  }
</script>

<style lang="scss">
  .podlove-player--chapters-progress {}

  .podlove-player--chapters-progress--indicator {
    position: absolute;
    width: 2px;
    height: 2px;
    top: 2px;

    &.last {
      width: 0;
      height: 0;
    }
  }
</style>
