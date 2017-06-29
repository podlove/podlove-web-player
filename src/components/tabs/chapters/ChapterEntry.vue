<template>
  <div class="chapters--entry"
    :style="chapterStyle(theme, chapter, hover)"
    @click="onChapterClick(index)"
    @mouseover="hover = true"
    @mouseleave="hover = false">

    <span class="index" v-if="hover" @click="onPlayButtonClick(index)">
      <PlayIcon size="12" :color="theme.tabs.body.icon"></PlayIcon>
    </span>
    <span class="index" v-else>{{index + 1}}</span>
    <span class="title truncate">{{chapter.title}}</span>
    <span class="timer">{{remainingTime(chapter, ghost.active ? ghost.time : playtime)}}</span>

    <span class="progress" :style="progressStyle(theme, chapter, ghost.active ? ghost.time : playtime)"></span>
  </div>
</template>

<script>
  import color from 'color'
  import store from 'store'
  import { secondsToTime } from 'utils/time'

  import PlayIcon from 'icons/PlayIcon.vue'

  const activeChapter = theme => ({
    'background-color': color(theme.tabs.body.backgroundActive).fade(0.9),
    color: theme.tabs.body.textActive
  })

  const chapterStyle = (theme, chapter, hover, even) => {
    if (chapter.active || hover) {
      return activeChapter(theme)
    }

    return {}
  }

  const progressStyle = (theme, chapter, playtime) => {
    if (!chapter.active || playtime > chapter.end) {
      return {}
    }

    let progress = ((playtime - chapter.start) * 100) / (chapter.end - chapter.start)

    return {
      'width': progress + '%',
      'background-color': theme.tabs.body.progress
    }
  }

  const remainingTime = (chapter, playtime) => {
    if (chapter.active) {
      return `-${secondsToTime(chapter.end - playtime)}`
    }

    return secondsToTime(chapter.end - chapter.start)
  }

  const onChapterClick = index => {
    store.dispatch(store.actions.setChapter(index))
  }

  const onPlayButtonClick = index => {
    store.dispatch(store.actions.setChapter(index))
    store.dispatch(store.actions.play())
  }

  export default {
    data () {
      return {
        theme: this.$select('theme'),
        chapters: this.$select('chapters'),
        playtime: this.$select('playtime'),
        ghost: this.$select('ghost'),
        hover: false
      }
    },
    methods: {
      chapterStyle,
      progressStyle,
      remainingTime,
      onChapterClick,
      onPlayButtonClick
    },
    components: {
      PlayIcon
    },
    props: ['chapter', 'index']
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'font';

  .chapters--entry {
    width: 100%;
    position: relative;
    padding: $padding / 2 $padding;
    font-weight: 300;
    display: flex;
    cursor: pointer;

    transition: background $animation-duration, color $animation-duration;

    .index {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: 30px;
    }

    .title {
      display: block;
      width: calc(100% - 30px - 30px)
    }

    .timer {
      display: block;
      text-align: right;
      @include font-monospace();
    }

    .progress {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 3px;
    }
  }
</style>
