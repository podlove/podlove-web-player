<template>
  <div class="audio-tab">
    <audio-volume-component class="seperator" v-if="components.audio.volumeControl"></audio-volume-component>
    <audio-rate-component class="seperator" v-if="components.audio.rateControl"></audio-rate-component>
    <footer-component></footer-component>
  </div>
</template>

<script>
  import AudioRateComponent from './AudioRate'
  import AudioVolumeComponent from './AudioVolume'

  import FooterComponent from 'shared/Footer'

  export default {
    data () {
      return {
        components: this.$select('components')
      }
    },
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
