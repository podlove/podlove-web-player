<template>
  <div class="header" :style="backgroundStyle">
    <PodloveError v-if="components.error"></PodloveError>
    <PodloveInfo v-if="components.info"></PodloveInfo>
  </div>

</template>

<script>
  import PodloveInfo from './Info.vue'
  import PodloveError from './Error.vue'

  export default {
    data () {
      return {
        theme: this.$select('theme'),
        components: this.$select('components')
      }
    },
    computed: {
      backgroundStyle () {
        return {
          'background-color': this.theme.player.background
        }
      }
    },
    components: {
      PodloveInfo,
      PodloveError
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .header {
    padding: $padding $padding 0 $padding;
    overflow: hidden;
  }
</style>
