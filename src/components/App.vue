<template>
  <div class="podlove" :class="{[mode]: mode, [platform]: platform}">
    <PodloveInfo />
    <PodlovePlayer />
    <PodloveTabs />
  </div>
</template>

<script>
  import PodloveInfo from './info/Info.vue'
  import PodlovePlayer from './player/Player.vue'
  import PodloveTabs from './tabs/Tabs.vue'

  export default {
    name: 'app',
    data () {
      return {
        mode: this.$select('mode'),
        platform: this.$select('runtime.platform')
      }
    },
    components: {
      PodloveInfo,
      PodlovePlayer,
      PodloveTabs
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'global';
  @import 'font';

  @import 'share';
  @import 'utils';
  @import 'grid';

  .podlove {
    display: block;
    position: relative;
    max-width: $width-xl;
    min-width: $width-xs;

    @include font();
  }
</style>
