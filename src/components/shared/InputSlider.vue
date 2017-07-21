<template>
  <div class="input-slider">
    <input
        type="range"
        :min="minValue"
        :max="maxValue"
        :value="value"
        :step="sliderSteps"
        @input="onSliderInput"
        @change="onSliderChange"
      />
    <span class="track"></span>
    <span class="thumb" :style="thumbStyle"></span>
    <slot></slot>
  </div>
</template>

<script>
  import { isUndefined } from 'lodash'

  const relativePosition = (current = 0, minimum = 0, maximum = 0) =>
    (((parseFloat(current, 10) - parseFloat(minimum, 10)) * 100) / (parseFloat(maximum, 10) - parseFloat(minimum, 10))) + '%'

  export default {
    props: ['min', 'max', 'step', 'value', 'onChange', 'onInput'],
    data () {
      return {
        theme: this.$select('theme')
      }
    },
    computed: {
      minValue () {
        return isUndefined(this.min) ? 0 : this.min
      },
      maxValue () {
        return isUndefined(this.max) ? 100 : this.max
      },
      sliderSteps () {
        return isUndefined(this.step) ? 0.1 : this.step
      },

      thumbStyle () {
        return {
          left: relativePosition(this.value, this.minValue, this.maxValue),
          'background-color': this.theme.button.background,
          'border-color': this.theme.button.border
        }
      }
    },
    methods: {
      onSliderInput (event) {
        this.onInput && this.onInput(event.target.value)
      },
      onSliderChange (event) {
        this.onChange && this.onChange(event.target.value)
      }
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  $slider-height: 44px;

  .input-slider {
    height: $slider-height;
    position: relative;

    .track {
      display: block;
      width: 100%;
      position: absolute;
      left: 0;
      top: calc(50% - 1px);
      height: 2px;
      pointer-events: none;
      background-color: rgba($accent-color, 0.5);
    }

    .thumb {
      position: absolute;
      top: calc(50% - 10px);
      border: 1px solid;
      height: 20px;
      width: 10px;
      margin-left: -5px;
      pointer-events: none;
      border-width: 1px;
      border-style: solid;
      border-radius: 2px;
    }
  }
</style>
