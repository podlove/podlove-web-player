<template>
  <div class="input-element">
    <h4 class="title">
      <span class="label">{{ $t('AUDIO.VOLUME') }}</span>
      <span class="volume">{{ toPercent(visualVolume) }}%</span>
    </h4>
    <div class="input-slider">
      <ButtonComponent class="slider-button mute-control" :style="buttonStyle" :click="toggleMute">
        <AudioIcon :color="theme.tabs.button.text" :volume="visualVolume * 100" :muted="muted"></AudioIcon>
      </ButtonComponent>
      <SliderComponent class="input-slider" min="0" max="1" :value="visualVolume" step="0.001" :onInput="setVolume" :thumbBorder="theme.tabs.input.border" :thumbColor="theme.tabs.slider.thumb"></SliderComponent>
    </div>
  </div>
</template>

<script>
  import store from 'store'

  import { get } from 'lodash'
  import { compose } from 'lodash/fp'
  import { toPercent } from 'utils/math'

  import SliderComponent from 'shared/Slider.vue'
  import ButtonComponent from 'shared/Button.vue'
  import AudioIcon from 'icons/AudioIcon.vue'

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
      SliderComponent,
      ButtonComponent,
      AudioIcon
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'inputs';

  $mute-control-width: calc(60px + #{$padding});

  .audio {
    .title {
      display: flex;
      justify-content: space-between;
    }

    .mute-control {
      width: $mute-control-width;
    }
  }
</style>
