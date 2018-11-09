<template>
  <div class="audio-tab" id="tab-audio">
    <audio-volume-component class="seperator" v-if="components.audio.volumeControl"></audio-volume-component>
    <audio-rate-component class="seperator" v-if="components.audio.rateControl"></audio-rate-component>
    <footer-component></footer-component>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'
  import { selectBufferAvailable } from 'store/selectors'

  import AudioRateComponent from './AudioRate'
  import AudioVolumeComponent from './AudioVolume'

  import FooterComponent from 'shared/Footer'

  export default {
    data: mapState({
      components: 'components',
      channelsAvailable: selectBufferAvailable
    }),
    components: {
      AudioRateComponent,
      AudioVolumeComponent,
      FooterComponent
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .audio-tab {
    width: 100%;
    padding-top: $padding;
  }
</style>
