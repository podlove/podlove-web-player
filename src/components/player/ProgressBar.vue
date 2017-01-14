<template>
  <div class="podlove-player--progress-bar" :class="playstate">
    <input
      type="range"
      min="0" :max="interpolate(duration)" step="0.1"
      :value="interpolate(playtime)"
       v-on:change="onChange"
       v-on:input="onInput"
    />
    <span class="podlove-player--progress-range"></span>
    <span class="podlove-player--progress-buffer" v-bind:style="bufferStyle(theme, buffer, duration)"></span>
    <span class="podlove-player--progress-thumb" v-bind:style="thumbStyle(theme, thumbPosition)"></span>
    <span class="podlove-player--progress-track" v-bind:style="trackStyle(theme, thumbPosition)"></span>
  </div>

</template>

<script>
  import store from 'store'
  import color from 'color'

  const interpolate = (num = 0) => Math.round(num * 100) / 100

  const relativePosition = (current = 0, maximum = 0) =>
    Math.round((current * 100) / maximum) + '%'

  const bufferStyle = (theme, buffer = 0, duration = 1) => ({
    width: relativePosition(buffer, duration),
    'background-color': color(theme.tertiary ? theme.primary : theme.secondary).fade(0.75)
  })

  const thumbStyle = (theme, position) => ({
      left: position,
      'background-color': theme.tertiary ? theme.primary : theme.secondary
  })

  const trackStyle = (theme, position) => ({
    width: position,
    'background-color': theme.tertiary ? theme.primary : theme.secondary
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
      thumbStyle,
      trackStyle
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'range-resets';

  .podlove-player--progress-bar {
    width: 100%;
    position: relative;
    height: $padding;
    transition: opacity ($animation-duration / 2), height $animation-duration;
    opacity: 1;

    &.start {
      height: 0;
      opacity: 0;
      overflow: hidden;
    }

    &.idle {
      .podlove-player--progress-thumb {
        opacity: 0;
      }

      height: $padding * 2;
    }
  }

  .podlove-player--progress-range {
    display: block;
    position: absolute;
    width: 100%;
    left: 0;
    top: 2px;
    height: 2px;
    background-color: rgba($accent-color, 0.25);
  }

  .podlove-player--progress-track {
    display: block;
    position: absolute;
    left: 0;
    top: 2px;
    height: 2px;
  }

  .podlove-player--progress-thumb {
    position: absolute;
    top: 0;
    margin-top: -5px;
    height: 14px;
    width: 4px;
    pointer-events: none;
  }

  .podlove-player--progress-buffer {
    display: block;
    opacity: 1;
    position: absolute;
    height: 2px;
    top: 2px;
    left: 0;
  }
</style>
