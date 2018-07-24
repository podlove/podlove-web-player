<template>
  <div class="footer">
    <a class="version" title="Podlove" href="//podlove.org" target="_blank">
      <podlove-player-icon class="icon" size="20"></podlove-player-icon><span class="link-text">Podlove Web Player v{{version}}</span>
    </a>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'
  import PodlovePlayerIcon from 'icons/PodlovePlayerIcon'

  export default {
    data: mapState({
      version: 'runtime.version'
    }),
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


