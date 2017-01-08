<template>
  <button class="podlove-player--button" @click="onButtonClick">
    <span class="podlove-player--play-icon" :class="playstate" :style="wrapperStyle">
      <PlayIcon color="#2B8AC6" v-if="playstate === 'start' || playstate === 'idle' || playstate === 'end'"/>
      <PauseIcon color="#2B8AC6" v-else />
      <span v-if="playstate === 'start'" class="play-text" :style="textStyle">{{secondsToTime(duration)}}</span>
      <span v-if="playstate === 'idle'" class="play-text" :style="textStyle">{{secondsToTime(playtime)}}</span>
      <span v-if="playstate === 'end'" class="play-text" :style="textStyle">replay</span>
    </span>
  </button>
</template>

<script>
  import store from 'store'
  import { secondsToTime } from 'utils/time'

  import PlayIcon from '../../icons/PlayIcon.vue'
  import PauseIcon from '../../icons/PauseIcon.vue'

  export default {
    name: 'PlayButton',
    components: {
      PlayIcon,
      PauseIcon
    },
    data() {
      return {
        duration: this.$select('duration'),
        playtime: this.$select('playtime'),
        playstate: this.$select('playstate'),
        wrapperStyle: {
          'background-color': '#fff'
        },
        textStyle: {
          color: '#2B8AC6'
        }
      }
    },
    methods: {
      secondsToTime,
      onButtonClick () {
        switch (this.playstate) {
          case 'start':
          case 'idle':
            store.dispatch(store.actions.play())
            break
          case 'end':
            store.dispatch(store.actions.setPlaytime(0))
            store.dispatch(store.actions.play())
            break
          default:
            store.dispatch(store.actions.pause())
        }
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../styles/variables';
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
</style>
