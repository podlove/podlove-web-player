<template>
  <div class="podlove-share">
    <ShareLink class="seperator" v-if="reference.origin"></ShareLink>
    <ShareEmbed v-if="reference.config && reference.share"></ShareEmbed>
  </div>
</template>

<script>
  import ShareLink from './ShareLink.vue'
  import ShareEmbed from './ShareEmbed.vue'

  export default {
    data() {
      return {
        share: this.$select('share'),
        reference: this.$select('reference'),
        playtime: this.$select('playtime'),
        duration: this.$select('duration'),
        theme: this.$select('theme')
      }
    },
    components: {
      ShareLink,
      ShareEmbed
    }
  }
</script>
