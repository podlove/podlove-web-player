<template>
  <div class="podlove" :class="mode">
    <div class="podlove-player--header" :style="headerStyle(theme)">
      <PodloveInfo />
      <PodlovePlayer />
    </div>
    <PodloveTabs />
    <PodloveShareOverlay />
  </div>
</template>

<script>
  import PodloveInfo from './info/Info.vue'
  import PodlovePlayer from './player/Player.vue'
  import PodloveTabs from './tabs/Tabs.vue'
  import PodloveShareOverlay from './overlays/share/Share.vue'

  const headerStyle = theme => ({
    'background-color': theme.player.background
  })

  export default {
    name: 'app',
    data () {
      return {
        theme: this.$select('theme'),
        mode: this.$select('mode')
      }
    },
    components: {
      PodloveInfo,
      PodlovePlayer,
      PodloveTabs,
      PodloveShareOverlay
    },
    methods: {
      headerStyle
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'global';
  @import 'font';

  @import 'share';
  @import 'utils';

  .podlove {
    display: block;
    position: relative;
    max-width: $width-xl;
    min-width: $width-xs;

    @include font();
  }
</style>
