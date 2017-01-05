<template>
  <div class="podlove-player--progress-bar">
    <input
      class="podlove-player--progress-slider"
      type="range"
      min="0" :max="interpolate(duration)" step="0.1"
      :value="interpolate(playtime)"
       v-on:change="onChange"
    />
    <span class="podlove-player--progress-buffer" v-bind:style="buffered(buffer, duration)"></span>
  </div>
</template>

<script>
  import store from 'store'

  const interpolate = (num = 0) => Math.round(num * 100) / 100
  const buffered = (buffer = 0, duration = 1) => {
    const bufferLength = (buffer * 100) / duration

    return {
      width: Math.round(bufferLength) + '%'
    }
  }

  export default {
    data () {
      return {
        playtime: this.$select('playtime'),
        duration: this.$select('duration'),
        buffer: this.$select('buffer')
      }
    },
    methods: {
      onChange (event) {
        store.dispatch(store.actions.updatePlaytime(event.target.value))
      },
      interpolate,
      buffered
    }
  }
</script>

<style lang="scss">
  @import '../../styles/variables';
  @import '../../styles/themes/ocean';
  // Progress Bar
  .podlove-player--progress-bar {
    width: 100%;
    position: relative;
    padding-bottom: $padding;
  }

  .podlove-player--progress-buffer {
    display: block;
    position: absolute;
    height: 2px;
    background: $secondary-color;
    top: 2px;
    left: 0;
  }

  // Slider
  .podlove-player--progress-slider {
    display: block;
    position: absolute;

    width: 100%;
    background-color: rgba($secondary-color, 0.6);
    height: 2px;
    -webkit-appearance: none;
    outline: none;
    border-color: transparent;
    color: transparent;
    left: 0;
  }

  // Thumb
  .podlove-player--progress-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: none;
    height: 15px;
    width: 3px;
    border-radius: 0;
    background: $secondary-color;
    cursor: pointer;
    margin-top: -2px;
  }
</style>
