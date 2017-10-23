<template>
  <div class="header" :style="backgroundStyle"
    v-if="components.header.error || components.header.info">
    <ErrorComponent v-if="components.header.error"></ErrorComponent>
    <InfoComponent v-if="components.header.info"></InfoComponent>
  </div>

</template>

<script>
  import InfoComponent from './Info.vue'
  import ErrorComponent from './Error.vue'

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
      InfoComponent,
      ErrorComponent
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .header {
    padding: 0 $padding;
    overflow: hidden;
  }
</style>
