<template>
  <button class="podlove-player--button" @click="onButtonClick">
    <span class="podlove-player--play-icon" :style="wrapperStyle">
      <Icon primary-color="#2B8AC6" secondary-color="#fff" v-if="playstate === 'start'"/>
      <Icon primary-color="#2B8AC6" secondary-color="#fff" v-else-if="playstate === 'idle'"/>
      <span v-if="playstate === 'start'" class="play-text" :style="textStyle">{{secondsToTime(duration)}}</span>
    </span>
  </button>
</template>

<script>
  import store from 'store'
  import { secondsToTime } from 'utils/time'

  import Icon from '../icons/PlayIcon.vue'

  export default {
    name: 'PlayButton',
    components: {
      Icon
    },
    data() {
      return {
        duration: this.$select('duration'),
        playstate: this.$select('playstate'),
        running: this.$select('running'),
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
        if (this.running) {
          store.dispatch(store.actions.pause())
        } else {
          store.dispatch(store.actions.play())
        }
      }
    }
  }
</script>

<style lang="scss">
  @import '../../styles/variables';
  $dimension: 50px;

  .podlove-player--play-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    height: $dimension;
    min-width: $dimension;

    border-radius: $dimension / 2;

    padding: $padding;

    .play-icon {
      display: block;
      /* visually adjustment */
      margin-left: 7px;
      box-sizing: content-box;
    }

    .play-text {
      display: block;
      margin-left: ($margin / 2);
      font-size: 20px;
      font-weight: 200;
    }
  }
</style>
