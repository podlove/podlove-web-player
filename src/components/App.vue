<template>
  <div class="podlove" :class="{[display]: display, [runtime.platform]: runtime.platform}" :style="appStyle">
    <header-component></header-component>
    <player-component></player-component>
    <tabs-component></tabs-component>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'

  import HeaderComponent from './header/Header'
  import PlayerComponent from './player/Player'
  import TabsComponent from './tabs/Tabs'

  export default {
    name: 'app',
    data: mapState('display', 'runtime', 'theme'),
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
    mounted () {
       this.$i18n.locale = this.runtime.language
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
  @import '~styles/marquee';
  @import '~styles/tooltip';

  .podlove {
    display: block;
    position: relative;
    width: 100%;
    max-width: $width-xl;
    min-width: $width-xs;

    @include font();
  }
</style>
