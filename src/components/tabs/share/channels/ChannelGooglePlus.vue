<template>
  <a :href="googlePlusLink" class="channel-link" target="_blank">
    <span class="channel-icon google-plus"><GooglePlusIcon color="#fff"></GooglePlusIcon></span>
  </a>
</template>

<script>
  import GooglePlusIcon from 'icons/GooglePlusIcon.vue'
  import { addQueryParameter } from 'utils/url'

  const LINK = 'https://plus.google.com/share'

  export default {
    props: ['link', 'color'],
    computed: {
      googlePlusLink () {
        return addQueryParameter(LINK, {url: this.link})
      }
    },
    components: {
      GooglePlusIcon
    }
  }
</script>

<style lang="scss">
  $channel-color: #dd4b39;

  .channel-icon.google-plus {
    background-color: $channel-color;
  }
</style>

