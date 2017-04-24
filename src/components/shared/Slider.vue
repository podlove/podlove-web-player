<template>
  <div class="podlove-player--slider">
    <input
        type="range"
        :min="minValue"
        :max="maxValue"
        :value="value"
        :step="sliderSteps"
        v-on:input="onSliderInput"
        v-on:change="onSliderChange"
      />
    <span class="slider--track"></span>
    <span class="slider--thumb" :style="thumbStyle(thumbPosition, thumbColor)"></span>
    <slot></slot>
  </div>
</template>

<script>
  import color from 'color'
  import { isUndefined } from 'lodash'

  const defaultThumbColor = color('#000').fade(0.1)

  const relativePosition = (current = 0, minimum = 0, maximum = 0) =>
    (((parseFloat(current, 10) - parseFloat(minimum, 10)) * 100) / (parseFloat(maximum, 10) - parseFloat(minimum, 10))) + '%'

  const thumbStyle = (left, color) => ({
    left,
    'background-color': color || defaultThumbColor
  })

  export default {
    props: ['min', 'max', 'step', 'value', 'onChange', 'onInput', 'thumbColor'],
    data () {
      return {
        thumbPosition: relativePosition(this.value, this.min || 0, this.max || 100)
      }
    },
    watch: {
      value: function () {
        this.thumbPosition = relativePosition(this.value, this.minValue, this.maxValue)
      }
    },
    computed: {
      minValue: function () {
        return isUndefined(this.min) ? 0 : this.min
      },
      maxValue: function () {
        return isUndefined(this.max) ? 100 : this.max
      },
      sliderSteps: function () {
        return isUndefined(this.step) ? 0.1 : this.step
      }
    },
    mounted: function () {
      this.thumbPosition = relativePosition(this.value, this.minValue, this.maxValue)
    },
    methods: {
      onSliderInput: function (event) {
        this.thumbPosition = relativePosition(event.target.value, this.minValue, this.maxValue)
        this.onInput && this.onInput(event.target.value)
      },
      onSliderChange: function (event) {
        this.onChange && this.onChange(event.target.value)
      },
      thumbStyle
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  $slider-height: 44px;

  .podlove-player--slider {
    height: $slider-height;
    margin: ($margin / 3) 0;
    position: relative;

    .slider--track {
      display: block;
      width: 100%;
      position: absolute;
      left: 0;
      top: calc(50% - 1px);
      height: 2px;
      pointer-events: none;
      background-color: rgba($accent-color, 0.5);
    }

    .slider--thumb {
      position: absolute;
      top: calc(50% - 10px);
      border: 1px solid;
      height: 20px;
      width: 10px;
      pointer-events: none;
      border: 1px solid $background-color;
    }
  }
</style>
