<template>
  <div class="audio">
    <AudioVolumeComponent class="seperator"></AudioVolumeComponent>
    <AudioRateComponent class="seperator"></AudioRateComponent>
    <div class="footer">
      <a class="version" title="Export Debug" :href="exportStore" download="web-player-debug.json">Podlove Web Player v{{version}}</a>
    </div>
  </div>
</template>

<script>
  import store from 'store'

  import AudioRateComponent from './AudioRate.vue'
  import AudioVolumeComponent from './AudioVolume.vue'

  export default {
    data () {
      return {
        version: this.$select('runtime.version')
      }
    },
    computed: {
      exportStore () {
        return `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(store.store.getState()))}`
      }
    },
    components: {
      AudioRateComponent,
      AudioVolumeComponent
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'inputs';

  .audio {
    width: 100%;

    .footer {
      margin: $margin;
      text-align: right;
    }

    .version {
      font-size: 0.8rem;
      color: rgba($accent-color, 0.75);
    }
  }
</style>
