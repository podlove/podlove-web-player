<template>
  <a :href="pinterestLink" class="channel-link" target="_blank">
    <span class="channel-icon pinterest" aria-hidden="true"><pinterest-icon color="#fff"></pinterest-icon></span>
    <span class="visually-hidden">{{ $t('A11Y.SHARE_CHANNEL', { channel: 'Pinterest' }) }}</span>
  </a>
</template>

<script>
  import PinterestIcon from 'icons/PinterestIcon'
  import { addQueryParameter } from 'utils/url'

  const LINK = 'https://pinterest.com/pin/create/bookmarklet/'

  export default {
    props: ['link', 'color', 'text', 'poster'],
    computed: {
      pinterestLink () {
        return addQueryParameter(LINK, {url: this.link, media: this.poster, is_video: false, description: this.text})
      }
    },
    components: {
      PinterestIcon
    }
  }
</script>

<style lang="scss">
  $channel-color: #BD081C;

  .channel-icon.pinterest {
    background-color: $channel-color;
  }
</style>

