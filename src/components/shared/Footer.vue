<template>
  <div class="footer">
    <a class="version" title="Podlove" href="//podlove.org" target="_blank">
      <PodlovePlayerIcon class="icon" size="20"></PodlovePlayerIcon><span class="link-text">Podlove Web Player v{{version}}</span>
    </a>
  </div>
</template>

<script>
import PodlovePlayerIcon from 'icons/PodlovePlayerIcon.vue'

export default {
  data () {
    return {
      version: this.$select('runtime.version')
    }
  },
  components: {
    PodlovePlayerIcon
  }
}
</script>

<style lang="scss">
  @import '~styles/variables';

  .footer {
    margin: $margin;
    display: flex;

    .version {
      display: flex;
      align-items: center;
      font-size: 0.8rem;
      margin-left: auto;
      color: rgba($accent-color, 0.75);
    }

    .icon {
      margin-right: $margin / 2;
    }
  }
</style>


