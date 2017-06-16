<template>
  <div class="chapters-progress">
    <span class="indicator"
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
    data () {
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
  .chapters-progress {
    .indicator {
      position: absolute;
      width: 2px;
      height: 2px;
      top: calc(50% - 1px);
      pointer-events: none;

      &.last {
        width: 0;
        height: 0;
      }
    }
  }
</style>
