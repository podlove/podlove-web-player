<template>
  <div class="input-element" :aria-label="$t('A11Y.VOLUME')">
    <label class="spaced" tabindex="0" :aria-label="$t('AUDIO_CURRENT', { volume: toPercent(visualVolume) })">
      <span class="input-label">{{ $t('AUDIO.VOLUME') }}</span>
      <span class="input-label" id="tab-audio--volume--current">{{ toPercent(visualVolume) }}%</span>
    </label>
    <div class="volume-slider centered">
      <button-component class="slider-button mute-control" :click="toggleMute" id="tab-audio--volume--mute">
        <speaker-icon :color="theme.button.text" :volume="visualVolume * 100" :muted="muted" aria-hidden="true"></speaker-icon>
        <span class="visually-hidden">{{ a11y }}</span>
      </button-component>
      <input-slider-component id="tab-audio--volume--input" min="0" max="1" :value="visualVolume" step="0.001" :onInput="setVolume"  :onDblClick="'volume'"  :aria-label="$t('A11Y.SET_VOLUME_IN_PERCENT')"></input-slider-component>
    </div>
  </div>
</template>

<script>
  import store from 'store'

  import { get } from 'lodash'
  import { compose } from 'lodash/fp'
  import { toPercent } from 'utils/math'

  import InputSliderComponent from 'shared/InputSlider'
  import ButtonComponent from 'shared/Button'
  import SpeakerIcon from 'icons/SpeakerIcon'

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
      },

      a11y () {
        return this.muted ? this.$t('A11Y.VOLUME_UNMUTE') : this.$t('A11Y.VOLUME_MUTE')
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
