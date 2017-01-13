<template>
  <div class="podlove-player--progress-bar" :class="playstate">
    <input
      class="podlove-player--progress-slider"
      type="range"
      min="0" :max="interpolate(duration)" step="0.1"
      :value="interpolate(playtime)"
       v-on:change="onChange"
       v-on:input="onInput"
    />
    <span class="podlove-player--progress-thumb" v-bind:style="thumbStyle(thumbPosition)"></span>
    <span class="podlove-player--progress-buffer" v-bind:style="bufferStyle(theme, buffer, duration)"></span>
  </div>

</template>

<script>
  import store from 'store'

  const interpolate = (num = 0) => Math.round(num * 100) / 100

  const relativePosition = (current = 0, maximum = 0) =>
    Math.round((current * 100) / maximum) + '%'

  const bufferStyle = (theme, buffer = 0, duration = 1) => ({
    width: relativePosition(buffer, duration),
    'background-color': theme.secondary
  })

  const thumbStyle = position => ({
      left: position
  })

  export default {
    data () {
      return {
        playtime: this.$select('playtime'),
        duration: this.$select('duration'),
        buffer: this.$select('buffer'),
        playstate: this.$select('playstate'),
        theme: this.$select('theme'),
        thumbPosition: 0
      }
    },
    watch: {
      playtime: function (time) {
        this.thumbPosition = relativePosition(time, this.duration)
      }
    },
    methods: {
      onChange (event) {
        store.dispatch(store.actions.updatePlaytime(event.target.value))
      },
      onInput (event) {
        this.thumbPosition = relativePosition(interpolate(event.target.value), this.duration)
      },
      interpolate,
      bufferStyle,
      thumbStyle
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'themes/ocean';

  // Progress Bar
  .podlove-player--progress-bar {
    width: 100%;
    position: relative;
    padding-bottom: $padding;
    transition: padding $animation-duration;

    &.start, &.idle {
      padding-bottom: 0;
      overflow: hidden;
    }
  }

  .podlove-player--progress-thumb {
    position: absolute;
    top: 0;
    margin-top: -5px;
    height: 14px;
    width: 4px;
    background-color: white;
    pointer-events: none;
  }

  .podlove-player--progress-buffer {
    display: block;
    position: absolute;
    height: 2px;
    top: 2px;
    left: 0;
  }

  // Slider
  .podlove-player--progress-slider {
    display: block;
    position: absolute;

    width: 100%;
    background-color: rgba($accent-color, 0.25);
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
    height: 14px;
    width: 4px;
    margin-left: -4px;
    border-radius: 0;
    background: transparent;
    cursor: pointer;
    margin-top: -2px;
    z-index: 99;
  }
</style>
