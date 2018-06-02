<template>
  <a :href="facebookLink" class="channel-link" target="_blank">
    <span class="channel-icon facebook" aria-hidden="true"><facebook-icon color="#fff"></facebook-icon></span>
    <span class="visually-hidden">{{ $t('A11Y.SHARE_CHANNEL', { channel: 'Facebook' }) }}</span>
  </a>
</template>

<script>
  import FacebookIcon from 'icons/FacebookIcon'
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

