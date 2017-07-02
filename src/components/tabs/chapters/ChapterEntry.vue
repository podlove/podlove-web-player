<template>
  <div class="chapters--entry"
    :style="chapterStyle(theme, chapter, hover)"
    @click="onChapterClick(ghost)"
    @mouseout="onMouseOut"
    @mousemove="onMouseMove">

    <span class="index" v-if="hover">
      <PlayIcon size="12" :color="theme.tabs.body.icon"></PlayIcon>
    </span>
    <span class="index" v-else>{{index + 1}}</span>
    <span class="title truncate">{{chapter.title}}</span>
    <span class="timer">{{remainingTime(chapter, ghost.active ? ghost.time : playtime)}}</span>

    <span class="progress" :style="progressStyle(theme, chapter, ghost, playtime)"></span>
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

  const progressStyle = (theme, chapter, ghost, playtime) => {
    let time = ghost.active ? ghost.time : playtime

    if (time < chapter.start || time > chapter.end) {
      return {}
    }

    let progress = ((time - chapter.start) * 100) / (chapter.end - chapter.start)

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

  const onChapterClick = ghost => {
    store.dispatch(store.actions.updatePlaytime(ghost.time))
    store.dispatch(store.actions.play())
  }

  export default {
    data () {
      return {
        theme: this.$select('theme'),
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

      onMouseOut () {
        this.hover = false
        store.dispatch(store.actions.disableGhostMode())
      },

      onMouseMove (event) {
        this.hover = true
        store.dispatch(store.actions.enableGhostMode())
        store.dispatch(store.actions.simulatePlaytime(this.chapter.start + (this.chapter.end - this.chapter.start) * event.offsetX / event.target.clientWidth))
      }
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
      pointer-events: none;
    }

    .title {
      display: block;
      width: calc(100% - 30px);
      pointer-events: none;
    }

    .timer {
      display: block;
      text-align: right;
      @include font-monospace();
      pointer-events: none;
    }

    .progress {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 3px;
      pointer-events: none;
    }
  }
</style>
