<template>
  <div class="input-element" :aria-label="$t('A11Y.VOLUME')">
    <label class="spaced" tabindex="0" :aria-label="$t('A11Y.VOLUME_CURRENT', { volume: toPercent(visualVolume) })">
      <span class="input-label">{{ $t('AUDIO.VOLUME') }}</span>
      <span class="input-state" id="tab-audio--volume--current">
        <input class="input-value" type="number" id="tab-audio--volume--value" :value="toPercent(visualVolume)" @input="setVolume($event.target.value / 100)"/>
        <span class="input-suffix">%</span>
      </span>
    </label>
    <div class="volume-slider centered">
      <button-component class="slider-button mute-control" @click.native="toggleMute()" id="tab-audio--volume--mute">
        <speaker-icon :color="theme.button.text" :volume="visualVolume * 100" :muted="muted" aria-hidden="true"></speaker-icon>
        <span class="visually-hidden">{{ a11y }}</span>
      </button-component>
      <input-slider-component
        id="tab-audio--volume--input"
        min="0"
        max="1"
        :pins="[{
          value: 0,
          label: '0%'
        }, {
          value: 0.25,
          label: '25%'
        }, {
          value: 0.5,
          label: '50%'
        }, {
          value: 0.75,
          label: '75%'
        }, {
          value: 1,
          label: '100%'
        }]"
        :value="visualVolume"
        step="0.001"
        @input="setVolume"
        @dblclick="setVolume(1)"
        :aria-label="$t('A11Y.SET_VOLUME_IN_PERCENT')">
      </input-slider-component>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'redux-vuex'
  import { toPercent } from 'utils/math'

  import InputSliderComponent from 'shared/InputSlider'
  import ButtonComponent from 'shared/Button'
  import SpeakerIcon from 'icons/SpeakerIcon'

  export default {
    data: mapState('volume', 'theme', 'muted'),
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
      ...mapActions('setVolume', 'unmute', 'mute'),
      toggleMute () {
        this.muted ? this.unmute() : this.mute()
      },
      toPercent
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
