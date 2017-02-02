<template>
  <div class="podlove">
    <PodloveHeader />
    <PodlovePlayer />
    <PodloveTabs />
  </div>
</template>

<script>
  import PodloveHeader from './header/Header.vue'
  import PodlovePlayer from './player/Player.vue'
  import PodloveTabs from './tabs/Tabs.vue'

  export default {
    name: 'app',
    components: {
      PodloveHeader,
      PodlovePlayer,
      PodloveTabs
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'global';
  @import 'font';

  .podlove {
    display: block;
    max-width: $width-xl;
    min-width: $width-xs;

    @include font();
  }
</style>
