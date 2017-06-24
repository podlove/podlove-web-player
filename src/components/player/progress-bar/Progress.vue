<template>
  <div class="progress">
    <input
      type="range"
      min="0" :max="interpolate(duration)" step="0.1"
      :value="interpolate(playtime)"
      @change="onChange"
      @input="onInput"
      @mousemove="onMouseMove"
      @mouseout="onMouseOut"
    />
    <span class="progress-range" :style="rangeStyle(theme)"></span>
    <span class="progress-buffer" :style="bufferStyle(theme, buffer, duration)"></span>
    <span v-for="quantile in quantiles" class="progress-track" :style="trackStyle(theme, duration, quantile)"></span>
    <ChaptersIndicator />
    <span class="ghost-thumb" :style="thumbStyle(theme, ghostPosition, ghost.active)"></span>
    <span class="progress-thumb" :class="{ active: thumbActive }" :style="thumbStyle(theme, thumbPosition)"></span>
  </div>
</template>

<script>
  import store from 'store'

  import ChaptersIndicator from './ChapterIndicator.vue'

  const interpolate = (num = 0) => Math.round(num * 100) / 100

  const relativePosition = (current = 0, maximum = 0) =>
    ((current * 100) / maximum) + '%'

  const rangeStyle = (theme) => ({
    'background-color': theme.player.progress.range
  })

  const bufferStyle = (theme, buffer = 0, duration = 1) => ({
    width: relativePosition(buffer, duration),
    'background-color': theme.player.progress.buffer
  })

  const thumbStyle = (theme, position, active = true) => ({
    display: active ? 'block' : 'none',
    left: position,
    'background-color': theme.player.progress.thumb,
    'border-color': theme.player.progress.border
  })

  const trackStyle = (theme, duration, [start, end]) => ({
    left: relativePosition(start, duration),
    width: relativePosition(end - start, duration),
    'background-color': theme.player.progress.track
  })

  export default {
    data () {
      let playtime = this.$select('playtime')
      let duration = this.$select('duration')
      let theme = this.$select('theme')

      return {
        playtime,
        duration,
        theme,

        buffer: this.$select('buffer'),
        playstate: this.$select('playstate'),
        thumbPosition: relativePosition(playtime, duration),
        quantiles: this.$select('quantiles'),

        ghost: this.$select('ghost'),
        ghostPosition: 0,
        thumbActive: false
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
        store.dispatch(store.actions.updatePlaytime(event.target.value))
      },
      onMouseMove (event) {
        if (event.offsetY < 13 && event.offsetY > 31) {
          this.thumbActive = false
          store.dispatch(store.actions.disableGhostMode())
          return
        }
        this.thumbActive = true
        this.ghostPosition = relativePosition(event.offsetX, event.target.clientWidth)
        store.dispatch(store.actions.simulatePlaytime(this.duration * event.offsetX / event.target.clientWidth))
        store.dispatch(store.actions.enableGhostMode())
      },
      onMouseOut (event) {
        this.thumbActive = false
        store.dispatch(store.actions.disableGhostMode())
        store.dispatch(store.actions.simulatePlaytime(this.playtime))
      },

      interpolate,
      rangeStyle,
      bufferStyle,
      thumbStyle,
      trackStyle
    },
    components: {
      ChaptersIndicator
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'range-resets';

  $progress-height: 44px;

  $progress-track-height: 2px;

  $progress-thumb-height: 14px;
  $progress-thumb-width: 6px;
  $progress-thumb-active-height: 18px;
  $progress-thumb-active-width: 8px;

  .progress {
    width: 100%;
    position: relative;
    height: $progress-height;
    transition: opacity ($animation-duration / 2), height $animation-duration;
    cursor: pointer;
  }

  .progress-range {
    display: block;
    position: absolute;
    width: 100%;
    left: 0;
    top: calc(50% - #{$progress-track-height / 2});
    height: $progress-track-height;
    background-color: rgba($accent-color, 0.25);
    pointer-events: none;
  }

  .progress-track {
    display: block;
    position: absolute;
    left: 0;
    top: calc(50% - #{$progress-track-height / 2});
    height:  $progress-track-height;
    pointer-events: none;
  }

  .progress-thumb {
    position: absolute;
    border: 1px solid;
    // border offset
    margin-left: -2px;
    height: $progress-thumb-height;
    top: calc(50% - #{$progress-thumb-height / 2});
    width: $progress-thumb-width;
    pointer-events: none;

    transition: all $animation-duration / 2;

    &.active {
      width: $progress-thumb-active-width;
      height: $progress-thumb-active-height;
      top: calc(50% - #{$progress-thumb-active-height / 2});
    }
  }

  .ghost-thumb {
    display: none;
    position: absolute;
    border: 1px solid transparent;
    opacity: 0.8;
    margin-left: -2px;
    height: $progress-thumb-height;
    top: calc(50% - #{$progress-thumb-height / 2});
    width: $progress-thumb-width;
    pointer-events: none;
  }

  .progress-buffer {
    display: block;
    opacity: 1;
    position: absolute;
    height: $progress-track-height;
    top: calc(50% - #{$progress-track-height / 2});
    left: 0;
    pointer-events: none;
  }
</style>
