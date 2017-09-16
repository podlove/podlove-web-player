<template>
  <a :href="facebookLink" class="channel-link" target="_blank">
    <span class="channel-icon facebook"><FacebookIcon color="#fff"></FacebookIcon></span>
  </a>
</template>

<script>
  import FacebookIcon from 'icons/FacebookIcon.vue'
  import { addQueryParameter } from 'utils/url'

  const LINK = 'https://www.facebook.com/sharer/sharer.php'

  export default {
    props: ['link', 'color'],
    computed: {
      facebookLink () {
        return addQueryParameter(LINK, {u: this.link})
      }
    },
    components: {
      FacebookIcon
    }
  }
</script>

<style lang="scss">
  $channel-color: #3b5998;

  .channel-icon.facebook {
    background-color: $channel-color;
  }
</style>

