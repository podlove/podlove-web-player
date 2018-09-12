<template>
  <a :href="redditLink" class="channel-link" target="_blank">
    <span class="channel-icon reddit" aria-hidden="true"><reddit-icon color="#fff"></reddit-icon></span>
    <span class="visually-hidden">{{ $t('A11Y.SHARE_CHANNEL', { channel: 'Reddit' }) }}</span>
  </a>
</template>

<script>
  import RedditIcon from 'icons/RedditIcon'
  import { addQueryParameter } from 'utils/url'

  const LINK = 'http://reddit.com/submit'

  export default {
    props: ['link', 'text'],
    computed: {
      redditLink () {
        return addQueryParameter(LINK, { url: this.link, title: this.text })
      }
    },
    components: {
      RedditIcon
    }
  }
</script>

<style lang="scss">
  $channel-color: #FF4500;

  .channel-icon.reddit {
    background-color: $channel-color;
  }
</style>

