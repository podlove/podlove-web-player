<template>
  <div class="podlove-settings">
    <a :href="exportStore()" download="podlove-web-player-debug.json">export debug state</button>
  </div>
</template>

<script>
  import store from 'store'

  const exportStore = () => {
    return `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(store.store.getState()))}`;
  }

  export default {
    methods: {
      exportStore
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  .podlove-settings {
    width: 100%;
    padding: $padding 0;
    text-align: center;
  }
</style>
