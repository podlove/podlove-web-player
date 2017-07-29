<template>
  <div class="podlove" :class="{[display]: display, [runtime.platform]: runtime.platform}">
    <HeaderComponent></HeaderComponent>
    <PlayerComponent></PlayerComponent>
    <TabsComponent></TabsComponent>
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
        display: this.$select('display'),
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
  @import 'utils';
  @import 'font';
  @import 'resets/resets';

  @import 'inputs';
  @import 'embed';
  @import 'share';

  @import 'transitions';
  @import 'animations';

  .podlove {
    display: block;
    position: relative;
    max-width: $width-xl;
    min-width: $width-xs;

    @include font();
  }
</style>
