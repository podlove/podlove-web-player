<template>
  <a :href="twitterLink" class="channel-link" target="_blank">
    <span class="channel-icon twitter"><TwitterIcon color="#fff"></TwitterIcon></span>
  </a>
</template>

<script>
  import TwitterIcon from 'icons/TwitterIcon.vue'
  import { addQueryParameter } from 'utils/url'

  const LINK = 'https://twitter.com/intent/tweet'

  export default {
    props: ['text', 'color'],
    computed: {
      twitterLink () {
        return addQueryParameter(LINK, {text: this.text})
      }
    },
    components: {
      TwitterIcon
    }
  }
</script>

<style lang="scss">
  @import '~styles/share';

  $channel-color: #1da1f2;

  .channel-icon.twitter {
    background-color: $channel-color;
  }
</style>
