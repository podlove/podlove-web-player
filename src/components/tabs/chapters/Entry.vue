<template>
  <div class="podlove-chapters--entry" v-bind:style="chapterStyle(theme, chapter)" @click="onChapterClick(chapter)">
    <span class="podlove-chapters--entry--index">{{index + 1}}</span>
    <span class="podlove-chapters--entry--title">{{chapter.title}}</span>
    <span class="podlove-chapters--entry--duration">{{secondsToTime(chapter.end - chapter.start)}}</span>

    <span class="podlove-chapters--entry--progress" v-bind:style="progresStyle(theme, chapter, playtime)"></span>
  </div>
</template>

<script>
  import color from 'color'
  import store from 'store'
  import {secondsToTime} from 'utils/time'

  const chapterStyle = (theme, chapter) => {
    const style = {
      'background-color': theme.secondary
    }

    if (chapter.active) {
      style['background-color'] = color(theme.primary).fade(0.9)
      style['color'] = theme.primary
    }

    return style
  }

  const progresStyle = (theme, chapter, playtime) => {
    if (!chapter.active || playtime > chapter.end) {
      return {}
    }

    let progress = ((playtime - chapter.start) * 100) / (chapter.end - chapter.start)

    return {
      'width': progress + '%',
      'background-color': theme.primary
    }
  }

  const onChapterClick = chapter => {
    store.dispatch(store.actions.updatePlaytime(chapter.start))
  }

  export default {
    data() {
      return {
        theme: this.$select('theme'),
        chapters: this.$select('chapters'),
        playtime: this.$select('playtime')
      }
    },
    methods: {
      chapterStyle,
      progresStyle,
      secondsToTime,
      onChapterClick
    },
    props: ['chapter', 'index']
  }
</script>

<style lang="scss">
  @import 'variables';

  .podlove-chapters--entry {
    width: 100%;
    position: relative;
    padding: $padding / 2 $padding;
    font-weight: 300;
    display: flex;
    cursor: pointer;
  }

  .podlove-chapters--entry--index {
    display: block;
    width: 30px;
  }

  .podlove-chapters--entry--title {
    display: block;
    width: calc(100% - 30px - 30px)
  }

  .podlove-chapters--entry--duration {
    display: block;
    width: 30px;
    text-align: right;
  }

  .podlove-chapters--entry--progress {
    position: absolute;
    left: 0;
    bottom: 1px;
    height: 2px;
    width: 100%;
    z-index: 99;
  }
</style>
