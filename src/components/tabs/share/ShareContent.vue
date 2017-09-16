<template>
  <div class="content">
    <div class="content-option" :class="{active: isActive('show')}" :style="isActive('show') ? activeContentStyle : {}" @click="setContent('show')">
      <span class="type">{{ $t('SHARE.CONTENT.SHOW') }}</span>
      <span class="title truncate">{{ show.title }}</span>
      <span class="active-indicator" :style="triangleStyle"></span>
    </div>
    <div class="content-option" :class="{active: isActive('episode')}" :style="isActive('episode') ? activeContentStyle : {}" @click="setContent('episode')">
      <span class="type">{{ $t('SHARE.CONTENT.EPISODE') }}</span>
      <span class="title truncate">{{ episode.title }}</span>
      <span class="active-indicator" :style="triangleStyle"></span>
    </div>
    <div class="content-option" v-if="currentChapter" :class="{active: isActive('chapter')}" :style="isActive('chapter') ? activeContentStyle : {}" @click="setContent('chapter')">
      <span class="type">{{ $t('SHARE.CONTENT.CHAPTER') }}</span>
      <span class="title truncate">{{ currentChapter }}</span>
      <span class="active-indicator" :style="triangleStyle"></span>
    </div>
    <div class="content-option" :class="{active: isActive('time')}" :style="isActive('time') ? activeContentStyle : {}" @click="setContent('time')">
      <span class="type">{{ $t('SHARE.CONTENT.TIME') }}</span>
      <span class="title truncate">{{ secondsToTime(playtime) }}</span>
      <span class="active-indicator" :style="triangleStyle"></span>
    </div>
  </div>
</template>

<script>
  import store from 'store'
  import { get } from 'lodash'
  import { compose } from 'lodash/fp'
  import { currentChapter } from 'utils/chapters'
  import { secondsToTime } from 'utils/time'

  export default {
    data () {
      return {
        share: this.$select('share'),
        theme: this.$select('theme'),
        episode: this.$select('episode'),
        show: this.$select('show'),
        chapters: this.$select('chapters'),
        playtime: this.$select('playtime')
      }
    },
    computed: {
      activeContentStyle () {
        return {
          background: this.theme.tabs.share.content.active.background,
          color: this.theme.tabs.share.content.active.color
        }
      },

      triangleStyle () {
        return {
          'border-color': `${this.theme.tabs.share.content.active.background} transparent transparent transparent`
        }
      },

      currentChapter () {
        return get(currentChapter(this.chapters), 'title', false)
      }
    },
    methods: {
      setContent: compose(store.dispatch.bind(store), store.actions.setShareContent),

      isActive (type) {
        if (this.share.content === type) {
          return true
        }

        return false
      },

      secondsToTime
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .content {
    display: flex;
    justify-content: center;
  }

  .content-option {
    display: flex;
    flex-direction: column;
    align-items: center;

    text-align: center;

    position: relative;
    cursor: pointer;

    width: $content-option-width;
    margin: 0 $margin;
    padding: $padding ($padding / 2);

    .cover {
      width: 100%;
      height: auto;
      margin-bottom: $margin;
    }

    .type {
      text-transform: uppercase;
    }

    .title {
      margin-bottom: $margin / 2;
      display: block;
      width: 100%;
    }

    .active-indicator {
      display: none;
      position: absolute;
      bottom: #{$padding / -2};
      left: 50%;
      margin-left: #{$padding / -2};
      width: 0;
      height: 0;
      border-style: solid;
      border-width: ($padding / 2) ($padding / 2) 0 ($padding / 2);
    }

    &.active .active-indicator {
      display: block;
    }
  }

   @media screen and (max-width: $width-l) {
    .content {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;

      .content-option .active-indicator {
        display: none;
      }
    }
  }
</style>
