<template>
  <div class="podlove-settings">
    <div class="seperator">
      <h4 class="label">
        <span class="title">Volume</span>
        <span class="volume">{{decimalToPercent(volume)}}%</span>
      </h4>
      <div class="input-slider">
        <PodloveButton class="slider-button" :click="changeVolume(volume, -5)" :style="buttonStyle(theme)">-</PodloveButton>
        <PodloveButton class="slider-button" :click="changeVolume(volume, 5)" :style="buttonStyle(theme)">+</PodloveButton>
        <PodloveSlider class="input-slider" min="0" max="1" :value="volume" step="0.001" :onInput="setVolume" :thumbColor="theme.tabs.slider.thumb"></PodloveSlider>
      </div>
    </div>
    <div class="seperator">
      <h4 class="label">
        <span class="title">Speed</span>
        <span class="rate">{{decimalToPercent(rate)}}%</span>
      </h4>
      <div class="input-slider">
        <PodloveButton class="slider-button" :click="changeRate(rate, -5)" :style="buttonStyle(theme)">-</PodloveButton>
        <PodloveButton class="slider-button" :click="changeRate(rate, 5)" :style="buttonStyle(theme)">+</PodloveButton>
        <PodloveSlider class="input-slider" min="0.5" max="4" :value="rate" step="0.001" :onInput="setRate" :thumbColor="theme.tabs.slider.thumb"></PodloveSlider>
      </div>
    </div>
    <div class="footer">
      <a class="version" title="Export Debug State" :href="exportStore()" download="podlove-web-player-debug.json">Podlove Web Player v{{version}}</a>
    </div>
  </div>
</template>

<script>
  import store from 'store'
  import PodloveSlider from 'shared/Slider.vue'
  import PodloveButton from 'shared/Button.vue'

  const exportStore = () => {
    return `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(store.store.getState()))}`;
  }

  const decimalToPercent = input => {
    input = parseFloat(input) * 100
    return Math.round(input)
  }

  const buttonStyle = (theme) => ({
    color: theme.tabs.button.text,
    background: theme.tabs.button.background
  })

  const setVolume = volume => {
    store.dispatch(store.actions.setVolume(volume))
  }

  const setRate = rate => {
    store.dispatch(store.actions.setRate(rate))
  }

  const roundUp = (base, number) => {
    number = Math.ceil(number)

    if (number % base === 0) {
      return number + base
    }

    return number + (base - number % base)
  }

  const changeRate = (rate, offset) => () => {
    store.dispatch(store.actions.setRate(roundUp(offset, (rate * 100)) / 100))
  }

  const changeVolume = (volume, offset) => () => {
    store.dispatch(store.actions.setVolume(roundUp(offset, (volume * 100)) / 100))
  }

  export default {
    data() {
      return {
        volume: this.$select('volume'),
        rate: this.$select('rate'),
        version: this.$select('runtime.version'),
        theme: this.$select('theme')
      }
    },
    methods: {
      exportStore,
      setVolume,
      setRate,
      changeRate,
      changeVolume,
      buttonStyle,
      decimalToPercent
    },
    components: {
      PodloveSlider,
      PodloveButton
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'inputs';

  $preset-width: 40px;

  .podlove-settings {
    width: 100%;
    padding: $padding;

    .range {
      display: flex;
      justify-content: space-between;
      margin-top: $margin * -1;
      color: rgba($accent-color, 0.25)
    }

    .footer {
      margin-top: $margin;
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
