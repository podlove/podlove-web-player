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
        <SliderComponent class="input-slider" min="0.5" max="4" :value="rate" step="0.001" :onInput="setRate" :thumbColor="theme.tabs.slider.thumb"></SliderComponent>
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
  import { toPercent, roundUp } from 'utils/math'

  import SliderComponent from 'shared/Slider.vue'
  import ButtonComponent from 'shared/Button.vue'

  // Template Functions
  const exportStore = () => {
    return `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(store.store.getState()))}`;
  }

  const buttonStyle = (theme) => ({
    color: theme.tabs.button.text,
    background: theme.tabs.button.background
  })

  // State Changers
  const setVolume = compose(store.dispatch.bind(store), store.actions.setVolume)
  const changeVolume = (offset, rate) => () => compose(setVolume, roundUp(offset))(rate)

  const setRate = compose(store.dispatch.bind(store), store.actions.setRate)
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
    methods: {
      exportStore,
      setVolume,
      setRate,
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
