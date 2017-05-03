<template>
  <div class="podlove-player--progress-bar" :class="playstate">
    <input
      type="range"
      min="0" :max="interpolate(duration)" step="0.1"
      :value="interpolate(playtime)"
      v-on:change="onChange"
      v-on:input="onInput"
    />
    <span class="progress-range"></span>
    <span class="progress-buffer" :style="bufferStyle(theme, buffer, duration)"></span>
    <span v-for="quantile in quantiles" class="progress-track" :style="trackStyle(theme, duration, quantile)"></span>
    <ChaptersIndicator />
    <span class="progress-thumb" :style="thumbStyle(theme, thumbPosition)"></span>
  </div>

</template>

<script>
  import store from 'store'
  import color from 'color'

  import ChaptersIndicator from './chapters/ChapterIndicator.vue'

  const interpolate = (num = 0) => Math.round(num * 100) / 100

  const relativePosition = (current = 0, maximum = 0) =>
    ((current * 100) / maximum) + '%'

  const bufferStyle = (theme, buffer = 0, duration = 1) => ({
    width: relativePosition(buffer, duration),
    'background-color': color(theme.player.progress.bar).fade(0.5)
  })

  const thumbStyle = (theme, position) => ({
    left: position,
    'background-color': theme.player.progress.thumb,
    'border-color': theme.player.progress.border
  })

  const trackStyle = (theme, duration, [start, end]) => ({
      left: relativePosition(start, duration),
      width: relativePosition(end - start, duration),
      'background-color': theme.player.progress.bar
  })

  export default {
    data () {
      let playtime = this.$select('playtime')
      let duration = this.$select('duration')
      return {
        playtime,
        duration,
        buffer: this.$select('buffer'),
        playstate: this.$select('playstate'),
        theme: this.$select('theme'),
        thumbPosition: relativePosition(playtime, duration),
        quantiles: this.$select('quantiles')
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
      interpolate,
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

  $progress-bar-height: 44px;

  .podlove-player--progress-bar {
    width: 100%;
    position: relative;
    height: $progress-bar-height;
    transition: opacity ($animation-duration / 2), height $animation-duration;
    opacity: 1;

    &.start {
      height: 0;
      opacity: 0;
      overflow: hidden;
    }
  }

  .progress-range {
    display: block;
    position: absolute;
    width: 100%;
    left: 0;
    top: calc(50% - 1px);
    height: 2px;
    background-color: rgba($accent-color, 0.25);
    pointer-events: none;
  }

  .progress-track {
    display: block;
    position: absolute;
    left: 0;
    top: calc(50% - 1px);
    height: 2px;
    pointer-events: none;
  }

  .progress-thumb {
    position: absolute;
    border: 1px solid;
    height: 14px;
    top: calc(50% - 7px);
    width: 6px;
    pointer-events: none;
  }

  .progress-buffer {
    display: block;
    opacity: 1;
    position: absolute;
    height: 2px;
    top: calc(50% - 1px);
    left: 0;
    pointer-events: none;
  }
</style>
