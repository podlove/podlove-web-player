<template>
  <div class="share">
    <ShareLinkComponent class="seperator" v-if="reference.origin"></ShareLinkComponent>
    <ShareEmbedComponent v-if="reference.config && reference.share"></ShareEmbedComponent>
  </div>
</template>

<script>
  import ShareLinkComponent from './ShareLink.vue'
  import ShareEmbedComponent from './ShareEmbed.vue'

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
      ShareLinkComponent,
      ShareEmbedComponent
    }
  }
</script>
