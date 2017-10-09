<template>
  <div class="audio-tab">
    <AudioVolumeComponent class="seperator" v-if="components.audio.volumeControl"></AudioVolumeComponent>
    <AudioRateComponent class="seperator" v-if="components.audio.rateControl"></AudioRateComponent>
    <FooterComponent></FooterComponent>
  </div>
</template>

<script>
  import AudioRateComponent from './AudioRate.vue'
  import AudioVolumeComponent from './AudioVolume.vue'

  import FooterComponent from 'shared/Footer.vue'

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
