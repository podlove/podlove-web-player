<template>
  <div class="input-element">
    <h4 class="title">
      <span class="label">{{ $t('SETTINGS.VOLUME') }}</span>
      <span class="volume">{{ toPercent(volume) }}%</span>
    </h4>
    <div class="input-slider">
      <ButtonComponent class="slider-button mute-control" :style="buttonStyle(theme)" :click="toggleMute">
        <SpeakerMuteIcon :color="theme.tabs.button.text" v-if="muted"/>
        <SpeakerIcon :color="theme.tabs.button.text" v-else />
      </ButtonComponent>
      <SliderComponent class="input-slider" min="0" max="1" :value="volume" step="0.001" :onInput="setVolume" :thumbBorder="theme.tabs.input.border" :thumbColor="theme.tabs.slider.thumb"></SliderComponent>
    </div>
  </div>
</template>

<script>
  import store from 'store'

  import { get } from 'lodash'
  import { compose, curry } from 'lodash/fp'
  import { toPercent, roundUp, round } from 'utils/math'

  import SliderComponent from 'shared/Slider.vue'
  import ButtonComponent from 'shared/Button.vue'
  import SpeakerIcon from 'icons/SpeakerIcon.vue'
  import SpeakerMuteIcon from 'icons/SpeakerMuteIcon.vue'

  // Template Functions
  const buttonStyle = (theme) => ({
    color: theme.tabs.button.text,
    background: theme.tabs.button.background,
    'border-color': theme.tabs.input.border
  })

  // State Changers
  const setVolume = compose(store.dispatch.bind(store), store.actions.setVolume)

  const toggleMute = () => {
    const muted = get(store.store.getState(), 'muted')

    if (muted) {
      store.dispatch(store.actions.unmute())
    } else {
      store.dispatch(store.actions.mute())
    }
  }

  export default {
    data() {
      return {
        volume: this.$select('volume'),
        theme: this.$select('theme'),
        muted: this.$select('muted')
      }
    },
    computed: {
      sliderRate: function () {
        return toSliderRate(this.rate)
      }
    },
    methods: {
      setVolume,
      buttonStyle,
      toPercent,
      toggleMute
    },
    components: {
      SliderComponent,
      ButtonComponent,
      SpeakerIcon,
      SpeakerMuteIcon
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'inputs';

  $mute-control-width: calc(60px + #{$padding});

  .settings {
    .title {
      display: flex;
      justify-content: space-between;
    }

    .mute-control {
      width: $mute-control-width;
    }
  }
</style>
