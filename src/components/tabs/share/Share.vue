<template>
  <div class="share">
    <ShareLinkComponent class="seperator" v-if="reference.origin"></ShareLinkComponent>
    <ShareEmbedComponent class="seperator" v-if="reference.config && reference.share"></ShareEmbedComponent>
    <ShareDownloadComponent v-if="share.download.files.length > 0"></ShareDownloadComponent>
  </div>
</template>

<script>
  import ShareLinkComponent from './ShareLink.vue'
  import ShareEmbedComponent from './ShareEmbed.vue'
  import ShareDownloadComponent from './ShareDownload.vue'

  export default {
    data () {
      return {
        share: this.$select('share'),
        reference: this.$select('reference'),
        theme: this.$select('theme')
      }
    },
    components: {
      ShareLinkComponent,
      ShareEmbedComponent,
      ShareDownloadComponent
    }
  }
</script>
