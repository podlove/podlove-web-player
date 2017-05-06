<template>
  <div class="podlove" :class="{[mode]: mode, [runtime.platform]: runtime.platform}">
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
      // i18n integration
      this.$i18n.locale = this.$select('runtime.language')

      return {
        mode: this.$select('mode'),
        runtime: this.$select('runtime')
      }
    },
    watch: {
      runtime (runtime) {
        // i18n integration
        this.$i18n.locale = runtime.language
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
