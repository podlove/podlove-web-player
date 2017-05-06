<template>
  <div class="podlove" :class="{[mode]: mode, [runtime.platform]: runtime.platform}">
    <HeaderComponent />
    <PlayerComponent />
    <TabsComponent />
  </div>
</template>

<script>
  import HeaderComponent from './header/Header.vue'
  import PlayerComponent from './player/Player.vue'
  import TabsComponent from './tabs/Tabs.vue'

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
      HeaderComponent,
      PlayerComponent,
      TabsComponent
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

  @import 'transitions';

  .podlove {
    display: block;
    position: relative;
    max-width: $width-xl;
    min-width: $width-xs;

    @include font();
  }
</style>
