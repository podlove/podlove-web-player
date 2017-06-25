<template>
  <ButtonComponent :click="onButtonClick">
    <span class="play-button" :style="wrapperStyle(theme)" :class="{
      wide: components.controls.button.variant.loading ||
            components.controls.button.variant.remaining ||
            components.controls.button.variant.duration ||
            components.controls.button.variant.replay ||
            components.controls.button.variant.retry
    }">
      <span class="inner" v-if="components.controls.button.variant.loading">
        <LoadingIndicator />
      </span>

      <PauseIcon :color="theme.player.actions.icon" v-if="components.controls.button.variant.playing" />

      <PlayIcon :color="theme.player.actions.icon" class="reset" v-if="components.controls.button.variant.pause" />

      <span class="inner" v-if="components.controls.button.variant.remaining">
        <PlayIcon :color="theme.player.actions.icon" />
        <span class="label" :style="textStyle(theme)">{{ secondsToTime(playtime) }}</span>
      </span>

      <span class="inner" v-if="components.controls.button.variant.duration">
        <PlayIcon :color="theme.player.actions.icon" />
        <span class="label" :style="textStyle(theme)">{{ secondsToTime(duration) }}</span>
      </span>

      <span class="inner" v-if="components.controls.button.variant.replay">
        <PlayIcon :color="theme.player.actions.icon" />
        <span class="label" :style="textStyle(theme)">{{ $t('PLAYER.REPLAY') }}</span>
      </span>

      <span class="inner" v-if="components.controls.button.variant.retry">
        <ReloadIcon :color="theme.player.actions.icon" />
        <span class="label" :style="textStyle(theme)">{{ $t('PLAYER.RETRY') }}</span>
      </span>
    </span>
  </ButtonComponent>
</template>

<script>
  import store from 'store'
  import { secondsToTime } from 'utils/time'

  import PlayIcon from 'icons/PlayIcon.vue'
  import PauseIcon from 'icons/PauseIcon.vue'
  import ErrorIcon from 'icons/ErrorIcon.vue'
  import ReloadIcon from 'icons/ReloadIcon.vue'

  import ButtonComponent from 'shared/Button.vue'
  import LoadingIndicator from './LoadingIndicator.vue'

  const wrapperStyle = theme => ({
    'background-color': theme.player.actions.background
  })

  const textStyle = theme => ({
    color: theme.player.actions.icon
  })

  export default {
    components: {
      ButtonComponent,
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
    methods: {
      secondsToTime,
      wrapperStyle,
      textStyle,
      onButtonClick () {
        switch (this.playstate) {
          case 'start':
          case 'idle':
          case 'pause':
          case 'error':
            store.dispatch(store.actions.play())
            break
          case 'end':
            store.dispatch(store.actions.restart())
            break
          default:
            store.dispatch(store.actions.pause())
        }
      }
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  $button-width: 50px;

  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;

    height: $button-width;
    width: $button-width;

    border-radius: $button-width / 2;
    transition: width $animation-duration * 2;

    .inner {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 ($padding * 2);
    }

    &.wide {
      min-width: ($button-width * 2) + 30px;
      width: auto;
    }

    .label{
      margin-left: ($margin / 2);
      font-size: 1rem;
      font-weight: 200;
      text-transform: uppercase;
    }

    .reset {
      display: block;
      /* visually adjustment */
      margin-left: 7px;
      box-sizing: content-box;
    }
  }
</style>
