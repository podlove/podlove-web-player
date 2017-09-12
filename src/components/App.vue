<template>
  <div class="podlove" :class="{[display]: display, [runtime.platform]: runtime.platform}" :style="appStyle">
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
        runtime: this.$select('runtime'),
        theme: this.$select('theme')
      }
    },
    watch: {
      runtime (runtime) {
        // i18n integration
        this.$i18n.locale = runtime.language
      }
    },
    computed: {
      appStyle () {
        return {
          background: this.theme.background
        }
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
  @import '~styles/variables';
  @import '~styles/global';
  @import '~styles/utils';
  @import '~styles/font';
  @import '~styles/text';
  @import '~styles/resets/resets';

  @import '~styles/inputs';
  @import '~styles/share';
  @import '~styles/embed';

  @import '~styles/transitions';
  @import '~styles/animations';

  .podlove {
    display: block;
    position: relative;
    width: 100%;
    max-width: $width-xl;
    min-width: $width-xs;

    @include font();
  }
</style>
