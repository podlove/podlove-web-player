<template>
  <a :href="linkedinLink" class="channel-link" target="_blank">
    <span class="channel-icon Linkedin" aria-hidden="true"><Linkedin-icon color="#fff"></Linkedin-icon></span>
    <span class="visually-hidden">{{ $t('A11Y.SHARE_CHANNEL', { channel: 'Linkedin' }) }}</span>
  </a>
</template>

<script>
  import LinkedinIcon from 'icons/LinkedinIcon'
  import { addQueryParameter } from 'utils/url'

  const LINK = 'https://www.linkedin.com/shareArticle'

  export default {
    props: ['link', 'color', 'text'],
    computed: {
      linkedinLink () {
        return addQueryParameter(LINK, { url: this.link, mini: true, summary: this.text})
      }
    },
    components: {
      LinkedinIcon
    }
  }
</script>

<style lang="scss">
  $channel-color: #0077B5;

  .channel-icon.Linkedin {
    background-color: $channel-color;
  }
</style>