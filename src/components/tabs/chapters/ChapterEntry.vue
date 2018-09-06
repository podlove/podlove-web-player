<template>
  <div class="chapters--entry"
    :class="{active: chapter.active}"
    :style="chapterStyle"
    @mouseover="onMouseOver"
    @mouseleave="onMouseLeave">
    <span class="index" v-if="hover" @click="onChapterPlayClick" aria-hidden="true">
      <link-icon size="20" :color="theme.tabs.body.icon" v-if="linkHover"></link-icon>
      <play-icon size="12" :color="theme.tabs.body.icon" v-else></play-icon>
    </span>

    <span class="index" aria-hidden="true" v-else>{{chapter.index}}</span>

    <div class="chapter--progress"
      v-if="runtime.platform === 'desktop'"
      @mouseout="onMouseOut"
      @mousemove.alt="onMouseMove"
      @click="onChapterPlayClick"
      @click.alt="onChapterClick"
       aria-hidden="true">
      <span class="title truncate" aria-hidden="true">{{chapter.title}}</span>
      <span class="link" v-if="chapter.href"><link-icon class="icon"></link-icon><a class="info-link truncate" :href="chapter.href" target="_blank" @mouseover="onMouseOverLink" @mouseleave="onMouseLeaveLink">{{chapter.linkTitle}}</a></span>
      <span class="timer" aria-hidden="true">{{remainingTime}}</span>
      <span class="progress" :style="progressStyle" aria-hidden="true"></span>
      <span class="progress" :style="progressGhostStyle"></span>
    </div>

    <div class="chapter--progress"
      v-else
      @click="onChapterPlayClick"
       aria-hidden="true">
      <span class="title truncate">{{chapter.title}}</span>
      <span class="timer">{{remainingTime}}</span>
      <span class="progress" :style="progressStyle"></span>
      <span class="progress" :style="progressGhostStyle"></span>
    </div>

    <button class="visually-hidden" @click="onChapterPlayClick">
      {{ $t('A11Y.CHAPTER_ENTRY', a11y) }}
    </button>
  </div>
</template>

<script>
  import { mapActions } from 'redux-vuex'

  import { fromPlayerTime } from 'utils/time'

  import PlayIcon from 'icons/PlayIcon'
  import LinkIcon from 'icons/LinkIcon'

  export default {
    props: ['chapter'],

    data () {
      return {
        ...this.mapState('theme', 'playtime', 'ghost', 'runtime'),
        hover: false,
        linkHover: false
      }
    },

    computed: {
      remainingTime () {
        if (this.chapter.active) {
          return `-${fromPlayerTime(this.chapter.end - this.playtime)}`
        }

        if (this.ghost.active && this.ghost.time > this.chapter.start && this.ghost.time < this.chapter.end) {
          return `-${fromPlayerTime(this.chapter.end - this.ghost.time)}`
        }

        return fromPlayerTime(this.chapter.end - this.chapter.start)
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
      },

      a11y () {
        const remaining = this.chapter.active ? this.chapter.end - this.playtime : this.chapter.end - this.chapter.start

        return {
          ...this.chapter,
          remaining: fromPlayerTime(remaining > 0 ? remaining : 0),
          duration: fromPlayerTime(this.chapter.end - this.chapter.start)
        }
      }
    },

    methods: {
      onMouseOver () {
        this.hover = true
      },

      onMouseLeave () {
        this.hover = false
      },

      onMouseOverLink () {
        this.linkHover = true
      },

      onMouseLeaveLink () {
        this.linkHover = false
      },

      ...mapActions({
        onMouseOut: 'disableGhostMode',

        onMouseMove: function ({ dispatch, actions }, event) {
          dispatch(actions.enableGhostMode())
          dispatch(actions.simulatePlaytime(this.chapter.start + (this.chapter.end - this.chapter.start) * event.offsetX / event.target.clientWidth))
        },

        onChapterClick: function ({ dispatch, actions }, event) {
          dispatch(actions.setChapter(this.chapter.index - 1))
          dispatch(actions.updatePlaytime(this.ghost.time))
          dispatch(actions.play())
          event.preventDefault()
          return false
        },

        onChapterPlayClick: function ({ dispatch, actions }, event) {
          if (this.linkHover) {
            return false
          }
          dispatch(actions.setChapter(this.chapter.index - 1))
          dispatch(actions.play())
          event.preventDefault()
          return false
        }

      })
    },
    components: {
      PlayIcon,
      LinkIcon
    }
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
        width: calc(100% - 4.4em);
        pointer-events: none;
      }

      .icon {
        flex-shrink: 0;    
      }
          
      .info-link {
        font-weight: bolder;
        text-align: right;
      }
      
      .link {
        display: flex;
        max-width: calc(40%);
      }

      .timer {
        min-width: 4.4em;
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
