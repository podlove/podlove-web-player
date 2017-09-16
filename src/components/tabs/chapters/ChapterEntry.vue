<template>
  <div class="chapters--entry"
    :class="{active: chapter.active}"
    :style="chapterStyle"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave">
    <span class="index" v-if="hover" @click="onChapterPlayClick">
      <PlayIcon size="12" :color="theme.tabs.body.icon"></PlayIcon>
    </span>
    <span class="index" v-else>{{index + 1}}</span>
    <div class="chapter--progress" v-if="runtime.platform === 'desktop'"
      @mouseout="onMouseOut"
      @mousemove="onMouseMove"
      @click="onChapterClick">
      <span class="title truncate">{{chapter.title}}</span>
      <span class="timer">{{remainingTime}}</span>
      <span class="progress" :style="progressStyle"></span>
      <span class="progress" :style="progressGhostStyle"></span>
    </div>

    <div class="chapter--progress" v-else
      @click="onChapterPlayClick">
      <span class="title truncate">{{chapter.title}}</span>
      <span class="timer">{{remainingTime}}</span>
      <span class="progress" :style="progressStyle"></span>
      <span class="progress" :style="progressGhostStyle"></span>
    </div>
  </div>
</template>

<script>
  import store from 'store'
  import runtime from 'utils/runtime'

  import { secondsToTime } from 'utils/time'

  import PlayIcon from 'icons/PlayIcon.vue'

  export default {
    data () {
      return {
        theme: this.$select('theme'),
        playtime: this.$select('playtime'),
        ghost: this.$select('ghost'),
        hover: false,
        runtime
      }
    },
    computed: {
      remainingTime () {
        if (this.chapter.active) {
          return `-${secondsToTime(this.chapter.end - this.playtime)}`
        }

        if (this.ghost.active && this.ghost.time > this.chapter.start && this.ghost.time < this.chapter.end) {
          return `-${secondsToTime(this.chapter.end - this.ghost.time)}`
        }

        return secondsToTime(this.chapter.end - this.chapter.start)
      },

      activeChapter () {
        return {
          'background-color': this.theme.tabs.chapters.active,
          color: this.theme.tabs.body.textActive
        }
      },

      chapterStyle () {
        if (this.chapter.active || this.hover) {
          return this.activeChapter
        }

        return {}
      },

      progressStyle () {
        if (!this.chapter.active || this.playtime > this.chapter.end) {
          return {}
        }

        let progress = ((this.playtime - this.chapter.start) * 100) / (this.chapter.end - this.chapter.start)

        return {
          'width': progress + '%',
          'background-color': this.theme.tabs.chapters.progress
        }
      },

      progressGhostStyle () {
        if (!this.ghost.active || this.ghost.time > this.chapter.end || this.ghost.time < this.chapter.start) {
          return {}
        }

        let progress = ((this.ghost.time - this.chapter.start) * 100) / (this.chapter.end - this.chapter.start)

        return {
          'width': progress + '%',
          'background-color': this.theme.tabs.chapters.ghost
        }
      }
    },
    methods: {
      onMouseOut () {
        store.dispatch(store.actions.disableGhostMode())
      },

      onMouseMove (event) {
        store.dispatch(store.actions.enableGhostMode())
        store.dispatch(store.actions.simulatePlaytime(this.chapter.start + (this.chapter.end - this.chapter.start) * event.offsetX / event.target.clientWidth))
      },

      onMouseOver () {
        this.hover = true
      },

      onMouseLeave () {
        this.hover = false
      },

      onChapterClick (event) {
        store.dispatch(store.actions.setChapter(this.index))
        store.dispatch(store.actions.updatePlaytime(this.ghost.time))
        store.dispatch(store.actions.play())
        event.preventDefault()
        return false
      },

      onChapterPlayClick (event) {
        store.dispatch(store.actions.setChapter(this.index))
        store.dispatch(store.actions.play())
        event.preventDefault()
        return false
      }
    },
    components: {
      PlayIcon
    },
    props: ['chapter', 'index']
  }
</script>

<style lang="scss">
  @import '~styles/variables';
  @import '~styles/font';

  .chapters--entry {
    width: 100%;
    position: relative;
    font-weight: 300;
    display: flex;
    cursor: pointer;

    transition: background $animation-duration, color $animation-duration;

    &.active {
      font-weight: 500;
    }

    .index {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      width: $index-width;
    }

    .chapter--progress {
      display: flex;
      align-items: center;
      position: relative;
      padding: ($padding / 2) 0;
      width: calc(100% - #{$index-width});

      .title {
        width: calc(100% - #{$index-width});
        pointer-events: none;
      }

      .timer {
        display: block;
        text-align: right;
        @include font-monospace();
        pointer-events: none;
        padding-right: $padding / 2;
      }

      .progress {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 3px;
        pointer-events: none;
      }
    }
  }
</style>
