<template>
  <div class="podlove-settings">
    <div class="podlove-settings__footer">
      <a class="podlove-settings__version" title="Export Debug State" :href="exportStore()" download="podlove-web-player-debug.json">Podlove Web Player v{{version}}</a>
    </div>
  </div>
</template>

<script>
  import store from 'store'

  const exportStore = () => {
    return `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(store.store.getState()))}`;
  }

  export default {
    data() {
      return {
         version: this.$select('debug.version')
      }
    },
    methods: {
      exportStore
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  .podlove-settings {
    width: 100%;
    padding: $padding;
  }

  .podlove-settings__footer {
    text-align: right;
  }

  .podlove-settings__version {
    font-size: 0.8rem;
    color: #444;
  }
</style>
