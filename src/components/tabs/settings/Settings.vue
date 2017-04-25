<template>
  <div class="podlove-settings">
    <div class="input">
      <h4 class="label">
        <span class="title">Volume</span>
        <span class="volume">{{decimalToPercent(volume)}}%</span>
      </h4>
      <PodloveSlider min="0" max="1" :value="volume" step="0.001" :onInput="setVolume" :thumbColor="theme.settings.slider.thumb"></PodloveSlider>
    </div>
    <div class="input">
      <h4 class="label">
        <span class="title">Speed</span>
        <span class="rate">{{decimalToPercent(rate)}}%</span>
      </h4>
      <div class="input--rate">
        <PodloveButton class="rate-button" :click="decreaseRate(rate)" :style="buttonStyle(theme)">-</PodloveButton>
        <PodloveButton class="rate-button" :click="increaseRate(rate)" :style="buttonStyle(theme)">+</PodloveButton>
        <PodloveSlider class="rate--slider" min="0.5" max="4" :value="rate" step="0.001" :onInput="setRate" :thumbColor="theme.settings.slider.thumb"></PodloveSlider>
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
    color: theme.settings.slider.text,
    background: theme.settings.slider.button
  })

  const setVolume = volume => {
    store.dispatch(store.actions.setVolume(volume))
  }

  const setRate = rate => {
    store.dispatch(store.actions.setRate(rate))
  }

  const roundUp = (base, number) => {
    if (number % base == 0) {
      return number + base
    }

    return number + (base - number % base)
  }

  const increaseRate = (rate) => {
    let reference = Date.now()

    rate = decimalToPercent(rate)
    return () => {
      let now = Date.now()

      if ((now - reference) < 500) {
        store.dispatch(store.actions.setRate(roundUp(10, rate) / 100))
      } else {
        store.dispatch(store.actions.setRate(roundUp(5, rate) / 100))
      }

      reference = now
    }
  }

  const decreaseRate = (rate) => {
    let reference = Date.now()

    rate = decimalToPercent(rate)
    return () => {
      let now = Date.now()

      if ((now - reference) < 500) {
        store.dispatch(store.actions.setRate(roundUp(-10, rate) / 100))
      } else {
        store.dispatch(store.actions.setRate(roundUp(-5, rate) / 100))
      }

      reference = now
    }
  }

  export default {
    data() {
      return {
        volume: this.$select('volume'),
        rate: this.$select('rate'),
        version: this.$select('debug.version'),
        theme: this.$select('theme')
      }
    },
    methods: {
      exportStore,
      setVolume,
      setRate,
      increaseRate,
      decreaseRate,
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

  $preset-width: 40px;
  $button-size: 30px;

  .podlove-settings {
    width: 100%;
    padding: $padding;

    .range {
      display: flex;
      justify-content: space-between;
      margin-top: $margin * -1;
      color: rgba($accent-color, 0.25)
    }

    .input {
      border-bottom: 1px dashed rgba($accent-color, 0.2);
      padding-bottom: $padding * 2;
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

    .input--rate {
      display: flex;
      align-items: center;
    }

    .rate--slider {
      width: 100%;
      margin-left: $margin / 2;
    }

    .rate-button {
      font-weight: bold;
      font-size: 1.2em;
      height: $button-size;
      width: $button-size;
      margin-right: $margin / 2;
    }
  }
</style>
