<template>
  <button class="control-button" @click="onButtonClick()" id="control-bar--play-button" ref="playbutton">
    <span class="play-button" :style="wrapperStyle" :class="{
      wide: components.controls.button.loading ||
            components.controls.button.remaining ||
            components.controls.button.duration ||
            components.controls.button.replay ||
            components.controls.button.retry
    }">
      <span class="inner" v-if="components.controls.button.loading" id="control-bar--play-button--loading" aria-hidden="true">
        <loading-indicator></loading-indicator>
      </span>

      <pause-icon :color="theme.player.actions.icon" v-if="components.controls.button.playing" id="control-bar--play-button--pause" aria-hidden="true"></pause-icon>

      <play-icon size="21" :color="theme.player.actions.icon" class="reset" v-if="components.controls.button.pause" id="control-bar--play-button--play" aria-hidden="true"></play-icon>

      <span class="inner" v-if="components.controls.button.remaining" id="control-bar--play-button--remaining" aria-hidden="true">
        <play-icon size="21" :color="theme.player.actions.icon"></play-icon>
        <span class="label" :style="textStyle">{{ fromPlayerTime(playtime) }}</span>
      </span>

      <span class="inner" v-if="components.controls.button.duration" id="control-bar--play-button--duration" aria-hidden="true">
        <play-icon size="21" :color="theme.player.actions.icon"></play-icon>
        <span class="label" :style="textStyle">{{ fromPlayerTime(duration) }}</span>
      </span>

      <span class="inner" v-if="components.controls.button.replay" id="control-bar--play-button--replay" aria-hidden="true">
        <play-icon size="21" :color="theme.player.actions.icon"></play-icon>
        <span class="label truncate" :style="textStyle">{{ $t('PLAYER.REPLAY') }}</span>
      </span>

      <span class="inner" v-if="components.controls.button.retry" id="control-bar--play-button--retry" aria-hidden="true">
        <reload-icon :color="theme.player.actions.icon"></reload-icon>
        <span class="label truncate" :style="textStyle">{{ $t('PLAYER.RETRY') }}</span>
      </span>
    </span>

    <!-- Accessibility -->
    <span class="visually-hidden">{{ a11y }}</span>
  </button>
</template>

<script>
  import store from 'store'
  import { fromPlayerTime, calcSeconds, calcMinutes, calcHours } from 'utils/time'

  import PlayIcon from 'icons/PlayIcon'
  import PauseIcon from 'icons/PauseIcon'
  import ErrorIcon from 'icons/ErrorIcon'
  import ReloadIcon from 'icons/ReloadIcon'

  import LoadingIndicator from './LoadingIndicator'

  export default {
    components: {
      LoadingIndicator,
      PlayIcon,
      PauseIcon,
      ErrorIcon,
      ReloadIcon
    },
    data () {
      return {
        duration: this.$select('duration'),
        playtime: this.$select('playtime'),
        theme: this.$select('theme'),
        components: this.$select('components'),
        playstate: this.$select('playstate')
      }
    },
    computed: {
      wrapperStyle () {
        return {
          'background-color': this.theme.player.actions.background
        }
      },
      textStyle () {
        return {
          color: this.theme.player.actions.icon
        }
      },
      a11y () {
        switch (this.playstate) {
          case 'start':
            return this.$t('A11Y.PLAYER_START', {
              hours: calcHours(this.duration),
              minutes: calcMinutes(this.duration),
              seconds: calcSeconds(this.duration)
            })
          case 'idle':
          case 'pause':
            return this.$t('A11Y.PLAYER_PLAY')
          case 'end':
            return this.$t('A11Y.PLAYER_RESTART')
          case 'loading':
            return this.$t('A11Y.PLAYER_LOADING')
          case 'error':
            return this.$t('A11Y.PLAYER_ERROR')
          default:
            return this.$t('A11Y.PLAYER_PAUSE')
        }
      }
    },
    methods: {
      fromPlayerTime,

      onButtonClick () {
        switch (this.playstate) {
          case 'start':
          case 'idle':
          case 'pause':
            store.dispatch(store.actions.play())
            break
          case 'end':
            store.dispatch(store.actions.restart())
            break
          case 'error':
            store.dispatch(store.actions.load())
            break
          default:
            store.dispatch(store.actions.pause())
            break
        }
      }
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;

    height: $button-width;
    width: $button-width;
    min-width: $button-width;

    border-radius: $button-width / 2;
    transition: width $animation-duration * 2;

    .inner {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 ($padding * 2);
    }

    &.wide {
      width: calc(#{$button-width * 2} + #{$padding * 2});
      max-width: calc(#{$button-width * 2} + #{$padding * 2});
    }

    .label{
      margin-left: ($margin / 2);
      font-size: 1rem;
      font-weight: 200;
      text-transform: uppercase;
      width: $button-width;
    }

    .reset {
      display: block;
      /* visually adjustment */
      margin-left: 7px;
      box-sizing: content-box;
    }
  }
</style>
