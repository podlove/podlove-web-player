<template>
  <div class="input-element">
    <h4 class="title">
      <span class="label">{{ $t('SETTINGS.SPEED') }}</span>
      <span class="rate">{{ toPercent(rate) }}%</span>
    </h4>
    <div class="input-slider">
      <ButtonComponent class="slider-button" :click="changeRate(-5, rate)" :style="buttonStyle(theme)">-</ButtonComponent>
      <ButtonComponent class="slider-button" :click="changeRate(5, rate)" :style="buttonStyle(theme)">+</ButtonComponent>
      <SliderComponent class="input-slider"
        min="0" max="1" step="0.001"
        :value="sliderRate" :onInput="toStateRate" :thumbBorder="theme.tabs.input.border" :thumbColor="theme.tabs.slider.thumb"></SliderComponent>
    </div>
  </div>
</template>

<script>
  import store from 'store'

  import { compose } from 'lodash/fp'
  import { toPercent, roundUp, round } from 'utils/math'

  import SliderComponent from 'shared/Slider.vue'
  import ButtonComponent from 'shared/Button.vue'

  const buttonStyle = (theme) => ({
    color: theme.tabs.button.text,
    background: theme.tabs.button.background,
    'border-color': theme.tabs.input.border
  })

  // Speed Modifiers
  const normalizeSliderValue = (value = 0) => {
    if (value < 0) {
      value = 0
    }

    if (value > 1) {
      value = 1
    }

    return value
  }

  const normalizeRateValue = (value = 0) => {
    if (value < 0.5) {
      value = 0.5
    }

    if (value > 4) {
      value = 4
    }

    return value
  }

  const speedSliderToState = (value = 0) => {
    value = parseFloat(value)

    if (value <= 0.5) {
      value = 0.5 + value
    } else {
      value = 2 * value + (value - 0.5) * 4
    }

    return value
  }

  const stateToSpeedSlider = (value = 0) => {
    value = parseFloat(value)

    if (value <= 1) {
      value = value - 0.5
    } else {
      value = (value + 2) / 6
    }

    return value
  }

  // State Changers
  const setRate = compose(store.dispatch.bind(store), store.actions.setRate)
  const toStateRate = compose(setRate, round, speedSliderToState, normalizeSliderValue)
  const toSliderRate = compose(round, stateToSpeedSlider, normalizeRateValue)

  const changeRate = (offset, rate) => () => compose(setRate, roundUp(offset))(rate)

  export default {
    data () {
      return {
        rate: this.$select('rate'),
        theme: this.$select('theme')
      }
    },
    computed: {
      sliderRate: function () {
        return toSliderRate(this.rate)
      }
    },
    methods: {
      setRate,
      toStateRate,
      toSliderRate,
      changeRate,
      buttonStyle,
      toPercent
    },
    components: {
      SliderComponent,
      ButtonComponent
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'inputs';

  .settings {
    .title {
      display: flex;
      justify-content: space-between;
    }
  }
</style>
