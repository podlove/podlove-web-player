<template>
  <button class="podlove-player--button" @click="onButtonClick">
    <span class="podlove-player--play-icon" :class="playstate" :style="wrapperStyle(theme)">
      <PlayIcon
        :color="theme.player.actions.icon"
        v-if="playstate === 'start' || playstate === 'idle' || playstate === 'end' || playstate === 'pause'"/>
      <PauseIcon :color="theme.player.actions.icon" v-if="playstate === 'playing'" />
      <span v-if="playstate === 'start'" class="play-text" :style="textStyle(theme)">{{secondsToTime(duration)}}</span>
      <span v-if="playstate === 'idle'" class="play-text" :style="textStyle(theme)">{{secondsToTime(playtime)}}</span>
      <span v-if="playstate === 'end'" class="play-text" :style="textStyle(theme)">replay</span>
    </span>
  </button>
</template>

<script>
  import store from 'store'
  import { secondsToTime } from 'utils/time'

  import PlayIcon from '../../icons/PlayIcon.vue'
  import PauseIcon from '../../icons/PauseIcon.vue'

  const wrapperStyle = theme => ({
    'background-color': theme.player.actions.background
  })

  const textStyle = theme => ({
    color: theme.player.actions.icon
  })

  export default {
    components: {
      PlayIcon,
      PauseIcon
    },
    data() {
      return {
        duration: this.$select('duration'),
        playtime: this.$select('playtime'),
        playstate: this.$select('playstate'),
        theme: this.$select('theme')
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
  $dimension: 50px;

  .podlove-player--play-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    height: $dimension;
    width: $dimension;

    border-radius: $dimension / 2;
    transition: width $animation-duration;

    &.start, &.idle, &.end {
      padding: $padding;
      width: ($dimension * 2) + $padding * 2;
    }

    &.loading {
      -webkit-animation: loading 1.2s infinite ease-in-out;
      animation: loading 1.2s infinite ease-in-out;
    }

    .play-icon {
      display: block;
      /* visually adjustment */
      margin-left: 7px;
      box-sizing: content-box;
    }

    .play-text {
      display: block;
      margin-left: ($margin / 2);
      font-size: 1rem;
      font-weight: 200;
      text-transform: uppercase;
    }
  }

  @-webkit-keyframes loading {
  0% {
    -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
            transform: perspective(120px) rotateX(0deg) rotateY(0deg); }
  50% {
    -webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
            transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg); }
  100% {
    -webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
            transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg); } }
@keyframes loading {
  0% {
    -webkit-transform: perspective(120px) rotateX(0deg) rotateY(0deg);
            transform: perspective(120px) rotateX(0deg) rotateY(0deg); }
  50% {
    -webkit-transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
            transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg); }
  100% {
    -webkit-transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
            transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg); } }
</style>
