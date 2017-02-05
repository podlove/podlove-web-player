<template>
  <div class="podlove">
    <PodloveHeader />
    <PodlovePlayer />
    <PodloveTabs />
    <PodloveShareOverlay />
  </div>
</template>

<script>
  import PodloveHeader from './header/Header.vue'
  import PodlovePlayer from './player/Player.vue'
  import PodloveTabs from './tabs/Tabs.vue'
  import PodloveShareOverlay from './overlays/share/Share.vue'

  export default {
    name: 'app',
    components: {
      PodloveHeader,
      PodlovePlayer,
      PodloveTabs,
      PodloveShareOverlay
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'global';
  @import 'font';

  .podlove {
    display: block;
    position: relative;
    max-width: $width-xl;
    min-width: $width-xs;

    @include font();
  }
</style>
