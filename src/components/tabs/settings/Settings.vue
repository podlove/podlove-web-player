<template>
  <div class="settings">
    <SettingsVolumeComponent class="seperator"/>
    <SettingsRateComponent class="seperator"/>
    <div class="footer">
      <a class="version" title="Export Debug" :href="exportStore()" download="web-player-debug.json">Podlove Web Player v{{version}}</a>
    </div>
  </div>
</template>

<script>
  import store from 'store'

  import SettingsRateComponent from './SettingsRate.vue'
  import SettingsVolumeComponent from './SettingsVolume.vue'

  // Template Functions
  const exportStore = () => {
    return `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(store.store.getState()))}`;
  }

  export default {
    data() {
      return {
        version: this.$select('runtime.version')
      }
    },
    methods: {
      exportStore
    },
    components: {
      SettingsRateComponent,
      SettingsVolumeComponent
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'inputs';

  .settings {
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
