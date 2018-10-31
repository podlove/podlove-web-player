<template>
  <div class="input-slider">
    <input
        type="range"
        :min="minValue"
        :max="maxValue"
        :value="value"
        :step="sliderSteps"
        @input="handleInput"
        @change="handleChange"
        @dblclick="handleDblclick"
      />
    <span class="track"></span>
    <span class="pin" v-for="(pin, index) in sliderPins" :key="index" :style="{ left: `${Math.round(pin.value * 100)}%` }">
      {{ pin.label }}
    </span>
    <span class="thumb" :style="thumbStyle"></span>
    <slot></slot>
  </div>
</template>

<script>
  import { isUndefined } from 'lodash'
  import { get } from 'lodash/fp'
  import { mapState } from 'redux-vuex'

  const pinRange = 0.01

  const relativePosition = (current = 0, minimum = 0, maximum = 0) =>
    (((parseFloat(current, 1000) - parseFloat(minimum, 1000)) * 100) / (parseFloat(maximum, 1000) - parseFloat(minimum, 1000)))

  export default {
    props: ['min', 'max', 'step', 'value', 'pins'],
    data: mapState('theme'),

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
      sliderPins () {
        return this.pins || []
      },

      thumbStyle () {
        const left = relativePosition(this.value, this.minValue, this.maxValue)
        return {
          left: `${left}%`,
          'background-color': this.theme.button.background
        }
      }
    },
    methods: {
      calcValue (event) {
        const value = event.target.value

        return this.sliderPins
          .map(get('value'))
          .find(pin => (pin + pinRange) >= value && (pin - pinRange <= value)) || value
      },

      // Events Handlers
      handleInput (event) {
        this.$emit('input', this.calcValue(event))
      },
      handleChange (event) {
        this.$emit('change', this.calcValue(event))
      },
      handleDblclick (event) {
        this.$emit('dblclick', event.target.value)
      }
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';
  @import '~styles/font';

  .input-slider {
    width: 100%;
    position: relative;
    height: $slider-height;
    margin: 0 1em;

    .track {
      display: block;
      width: 100%;
      position: absolute;
      left: 0;
      top: calc(50% - 1px);
      height: 3px;
      pointer-events: none;
      background-color: $subtile-color;
      border-radius: 2px;
    }

    .pin {
      position: absolute;
      top: -10px;
      color: $subtile-color;
      font-weight: 500;
      font-size: 1em;
      display: block;
      width: 30px;
      margin-left: -15px;
      text-align: center;
    }

    .thumb {
      position: absolute;
      top: calc(50% - 12px);
      border: 1px solid;
      height: 24px;
      width: 24px;
      pointer-events: none;
      border-width: 2px;
      border-style: solid;
      border-radius: 12px;
      border-color: $subtile-color;
      margin-left: -12px;
    }
  }
</style>
