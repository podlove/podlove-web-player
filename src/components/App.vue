<template>
  <div class="podlove">
    <PodloveHeader />
    <PodlovePlayer />
  </div>
</template>

<script>
  import PodloveHeader from './Header.vue'
  import PodlovePlayer from './player/Player.vue'

  export default {
    name: 'app',
    components: {
      PodloveHeader,
      PodlovePlayer
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

    @include roboto-font();
  }
</style>
