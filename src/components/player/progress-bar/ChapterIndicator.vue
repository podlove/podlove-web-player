<template>
  <div class="chapters-progress">
    <span class="indicator"
      v-for="(chapter, index) in chapters"
      v-bind:key="index"
      :style="indicatorStyle(chapter)"
      :class="{ last: isLast(index) }"></span>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        chapters: this.$select('chapters'),
        theme: this.$select('theme'),
        duration: this.$select('duration')
      }
    },
    methods: {
      isLast (index) {
        return this.chapters.length - 1 === index
      },
      indicatorStyle (chapter) {
        return {
          left: ((chapter.end * 100) / this.duration) + '%',
          background: this.theme.player.progress.seperator
        }
      }
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
