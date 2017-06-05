<template>
  <div class="settings">
    <div class="seperator input-element">
      <h4 class="title label">
        <span class="title">{{ $t('SETTINGS.VOLUME') }}</span>
        <span class="volume">{{ toPercent(volume) }}%</span>
      </h4>
      <div class="input-slider">
        <ButtonComponent class="slider-button" :click="changeVolume(-5, volume)" :style="buttonStyle(theme)">-</ButtonComponent>
        <ButtonComponent class="slider-button" :click="changeVolume(5, volume)" :style="buttonStyle(theme)">+</ButtonComponent>
        <SliderComponent class="input-slider" min="0" max="1" :value="volume" step="0.001" :onInput="setVolume" :thumbColor="theme.tabs.slider.thumb"></SliderComponent>
      </div>
    </div>
    <div class="seperator input-element">
      <h4 class="title label">
        <span class="title">{{ $t('SETTINGS.SPEED') }}</span>
        <span class="rate">{{ toPercent(rate) }}%</span>
      </h4>
      <div class="input-slider">
        <ButtonComponent class="slider-button" :click="changeRate(-5, rate)" :style="buttonStyle(theme)">-</ButtonComponent>
        <ButtonComponent class="slider-button" :click="changeRate(5, rate)" :style="buttonStyle(theme)">+</ButtonComponent>
        <SliderComponent class="input-slider"
          min="0" max="1" step="0.001"
          :value="sliderRate" :onInput="toStateRate" :thumbColor="theme.tabs.slider.thumb"></SliderComponent>
      </div>
    </div>
    <div class="footer">
      <a class="version" title="Export Debug" :href="exportStore()" download="web-player-debug.json">Podlove Web Player v{{version}}</a>
    </div>
  </div>
</template>

<script>
  import store from 'store'

  import { compose, curry } from 'lodash/fp'
  import { toPercent, roundUp, round } from 'utils/math'

  import SliderComponent from 'shared/Slider.vue'
  import ButtonComponent from 'shared/Button.vue'

  // Template Functions
  const exportStore = () => {
    return `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(store.store.getState()))}`;
  }

  const buttonStyle = (theme) => ({
    color: theme.tabs.button.text,
    border: `1px solid ${theme.tabs.button.text}`,
    background: theme.tabs.button.background
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
  const setVolume = compose(store.dispatch.bind(store), store.actions.setVolume)
  const setRate = compose(store.dispatch.bind(store), store.actions.setRate)

  const toStateRate = compose(setRate, round, speedSliderToState, normalizeSliderValue)
  const toSliderRate = compose(round, stateToSpeedSlider, normalizeRateValue)

  const changeVolume = (offset, rate) => () => compose(setVolume, roundUp(offset))(rate)
  const changeRate = (offset, rate) => () => compose(setRate, roundUp(offset))(rate)

  export default {
    data() {
      return {
        volume: this.$select('volume'),
        rate: this.$select('rate'),
        version: this.$select('runtime.version'),
        theme: this.$select('theme')
      }
    },
    computed: {
      sliderRate: function () {
        return toSliderRate(this.rate)
      }
    },
    methods: {
      exportStore,
      setVolume,
      setRate,
      toStateRate,
      toSliderRate,
      changeRate,
      changeVolume,
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

  $preset-width: 40px;

  .settings {
    width: 100%;

    .range {
      display: flex;
      justify-content: space-between;
      margin-top: $margin * -1;
      color: rgba($accent-color, 0.25)
    }

    .footer {
      margin: $margin;
      text-align: right;
    }

    .version {
      font-size: 0.8rem;
      color: rgba($accent-color, 0.75);
    }

    .label {
      display: flex;
      justify-content: space-between;
    }

    .preset {
      width: $preset-width;
    }
  }
</style>
