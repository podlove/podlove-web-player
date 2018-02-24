<template>
  <a :href="mailLink" class="channel-link">
    <span class="channel-icon mail"><mail-icon color="#fff"></mail-icon></span>
  </a>
</template>

<script>
  import MailIcon from 'icons/MailIcon'
  import { addQueryParameter } from 'utils/url'

  const LINK = 'mailto:'

  export default {
    props: ['text', 'subject', 'color'],
    computed: {
      mailLink () {
        return addQueryParameter(LINK, {body: this.text, subject: this.subject})
      }
    },
    components: {
      MailIcon
    }
  }
</script>

<style lang="scss">
  $channel-color: #888;

  .channel-icon.mail {
    background-color: $channel-color;
  }
</style>
