<template>
  <div class="header" :style="backgroundStyle(theme)">
    <PodloveError v-if="components.error"/>
    <PodloveInfo v-if="components.info"/>
  </div>

</template>

<script>
  import store from 'store'
  import color from 'color'

  import PodloveInfo from './Info.vue'
  import PodloveError from './Error.vue'

  const backgroundStyle = theme => ({
    'background-color': theme.player.background
  })

  export default {
    data () {
      return {
        theme: this.$select('theme'),
        components: this.$select('components')
      }
    },
    methods: {
      backgroundStyle
    },
    components: {
      PodloveInfo,
      PodloveError
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  .header {
    padding: $padding $padding 0 $padding;
    overflow: hidden;
  }
</style>
