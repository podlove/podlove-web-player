<template>
  <div class="podlove-settings">
    <div class="input">
      <h4 class="label">
        <span class="title">Volume</span>
        <span class="volume">{{decimalToPercent(volume)}}</span>
      </h4>
      <PodloveSlider min="0" max="1" :value="volume" step="0.001" :onInput="setVolume" :thumbColor="theme.settings.slider.thumb"></PodloveSlider>
      <div class="range">
        <span class="range--start">0%</span>
        <span class="range--end">100%</span>
      </div>
    </div>
    <div class="input">
      <h4 class="label">
        <span class="title">Rate</span>
        <div>
          <PodloveButton class="solid preset" :class="{active: rate > 0.75 && rate < 0.85}" :click="fixedRate(0.8)">0.8x</PodloveButton>
          <PodloveButton class="solid preset" :class="{active: rate > 0.95 && rate < 1.05}" :click="fixedRate(1)">1x</PodloveButton>
          <PodloveButton class="solid preset" :class="{active: rate > 1.45 && rate < 1.55}" :click="fixedRate(1.5)">1.5x</PodloveButton>
          <PodloveButton class="solid preset" :class="{active: rate > 1.95 && rate < 2.05}" :click="fixedRate(2)">2x</PodloveButton>
          <PodloveButton class="solid preset" :class="{active: rate > 2.95 && rate < 3.05}" :click="fixedRate(3)">3x</PodloveButton>
        </div>
      </h4>
      <PodloveSlider min="0.5" max="4" :value="rate" step="0.001" :onInput="setRate" :thumbColor="theme.settings.slider.thumb"></PodloveSlider>
      <div class="range">
        <span class="range--start">0.5x</span>
        <span class="range--end">4x</span>
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

  const setVolume = volume => {
    store.dispatch(store.actions.setVolume(volume))
  }

  const setRate = rate => {
    store.dispatch(store.actions.setRate(rate))
  }

  const fixedRate = rate => () => setRate(rate)

  const decimalToPercent = input => {
    return parseInt(input * 100, 10) + '%'
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
      fixedRate,
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
  }
</style>
