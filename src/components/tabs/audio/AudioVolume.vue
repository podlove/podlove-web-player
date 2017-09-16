<template>
  <div class="input-element">
    <label class="spaced">
      <span class="input-label">{{ $t('AUDIO.VOLUME') }}</span>
      <span class="input-label">{{ toPercent(visualVolume) }}%</span>
    </label>
    <div class="volume-slider centered">
      <ButtonComponent class="slider-button mute-control" :click="toggleMute">
        <SpeakerIcon :color="theme.button.text" :volume="visualVolume * 100" :muted="muted"></SpeakerIcon>
      </ButtonComponent>
      <InputSliderComponent min="0" max="1" :value="visualVolume" step="0.001" :onInput="setVolume"></InputSliderComponent>
    </div>
  </div>
</template>

<script>
  import store from 'store'

  import { get } from 'lodash'
  import { compose } from 'lodash/fp'
  import { toPercent } from 'utils/math'

  import InputSliderComponent from 'shared/InputSlider.vue'
  import ButtonComponent from 'shared/Button.vue'
  import SpeakerIcon from 'icons/SpeakerIcon.vue'

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
    data () {
      return {
        volume: this.$select('volume'),
        theme: this.$select('theme'),
        muted: this.$select('muted')
      }
    },
    computed: {
      buttonStyle () {
        return {
          color: this.theme.tabs.button.text,
          background: this.theme.tabs.button.background,
          'border-color': this.theme.tabs.input.border
        }
      },
      visualVolume () {
        if (this.muted) {
          return 0
        }

        return this.volume
      }
    },
    methods: {
      setVolume,
      toPercent,
      toggleMute
    },
    components: {
      InputSliderComponent,
      ButtonComponent,
      SpeakerIcon
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .audio-tab {
    .mute-control {
      width: $mute-control-width;
    }
  }
</style>
