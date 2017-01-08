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
  @import '../styles/variables';
  @import '../styles/global';
  @import '../styles/font';

  .podlove {
    display: block;
    max-width: 756px;
    @include roboto-font();
  }
</style>
