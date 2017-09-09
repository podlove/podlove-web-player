<template>
  <div class="progress">
    <input v-if="runtime.platform === 'desktop'"
      type="range"
      min="0" :max="interpolate(duration)"
      :value="interpolate(playtime)"
      @change="onChange"
      @input="onInput"
      @mousemove="onMouseMove"
      @mouseout="onMouseOut"
    >
    <input v-else
      type="range"
      min="0" :max="interpolate(duration)"
      :value="interpolate(playtime)"
      @change="onChange"
      @input="onInput"
    >
    <span class="progress-range" :style="rangeStyle"></span>
    <span class="progress-buffer" v-for="(buffering, index) in buffer" :style="bufferStyle(buffering)" :key="index"></span>
    <span v-for="(quantile, index) in quantiles" class="progress-track" :style="trackStyle(quantile)" :key="index"></span>
    <ChaptersIndicator></ChaptersIndicator>
    <span class="ghost-thumb" :style="thumbStyle(ghostPosition, ghost.active)"></span>
    <span class="progress-thumb" :class="{ active: thumbActive }" :style="thumbStyle(thumbPosition, true)"></span>
  </div>
</template>

<script>
  import store from 'store'
  import runtime from 'utils/runtime'
  import { interpolate, relativePosition } from 'utils/math'

  import ChaptersIndicator from './ChapterIndicator.vue'

  export default {
    data () {
      let playtime = this.$select('playtime')
      let duration = this.$select('duration')
      let theme = this.$select('theme')
      let ghost = this.$select('ghost')

      return {
        playtime,
        duration,
        theme,
        ghost,

        buffer: this.$select('buffer'),
        playstate: this.$select('playstate'),
        thumbPosition: relativePosition(playtime, duration),
        quantiles: this.$select('quantiles'),

        ghostPosition: relativePosition(ghost.time, duration),
        thumbActive: false,
        runtime
      }
    },
    watch: {
      playtime: function (time) {
        this.thumbPosition = relativePosition(time, this.duration)
      },
      ghost: function (ghost) {
        this.ghostPosition = relativePosition(ghost.time, this.duration)
      }
    },
    computed: {
      rangeStyle () {
        return {
          'background-color': this.theme.player.progress.range
        }
      }
    },
    methods: {
      onChange (event) {
        store.dispatch(store.actions.updatePlaytime(event.target.value))
      },

      onInput (event) {
        this.thumbAnimated = false
        store.dispatch(store.actions.disableGhostMode())
        this.thumbPosition = relativePosition(interpolate(event.target.value), this.duration)
        store.dispatch(store.actions.updatePlaytime(event.target.value))
      },

      onMouseMove (event) {
        if ((event.offsetY < 13 && event.offsetY > 31) || event.offsetX < 0 || event.offsetX > event.target.clientWidth) {
          this.thumbActive = false
          store.dispatch(store.actions.disableGhostMode())
          return false
        }

        this.thumbAnimated = true
        this.thumbActive = true

        store.dispatch(store.actions.simulatePlaytime(this.duration * event.offsetX / event.target.clientWidth))
        store.dispatch(store.actions.enableGhostMode())

        return false
      },

      onMouseOut (event) {
        this.thumbActive = false
        store.dispatch(store.actions.disableGhostMode())
        store.dispatch(store.actions.simulatePlaytime(this.playtime))

        return false
      },

      thumbStyle (position, active) {
        return {
          display: active ? 'block' : 'none',
          left: position,
          'background-color': this.theme.player.progress.thumb,
          'border-color': this.theme.player.progress.border
        }
      },

      trackStyle ([start, end]) {
        return {
          left: relativePosition(start, this.duration),
          width: relativePosition(end - start, this.duration),
          'background-color': this.theme.player.progress.track
        }
      },

      bufferStyle ([start, end]) {
        return {
          left: relativePosition(start, this.duration),
          width: relativePosition(end - start, this.duration),
          'background-color': this.theme.player.progress.buffer
        }
      },

      interpolate
    },
    components: {
      ChaptersIndicator
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

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

    transition: left $animation-duration / 2;

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
