<template>
  <div class="share-tab">
    <div class="content-select">
      <ShareContentComponent></ShareContentComponent>
    </div>

    <div class="channel-select" :style="sectionStyle">
      <span class="label">{{ $t('SHARE.SHARE_CHANNEL') }}</span>
      <ShareChannelsComponent :type="share.content"></ShareChannelsComponent>

      <span class="label" v-if="hasLink">{{ $t('SHARE.SHARE_LINK') }}</span>
      <ShareLinkComponent :type="share.content" v-if="hasLink"></ShareLinkComponent>
    </div>

    <ShareEmbedComponent :type="share.content"></ShareEmbedComponent>
  </div>
</template>

<script>
  import ShareChannelsComponent from './ShareChannels.vue'
  import ShareContentComponent from './ShareContent.vue'
  import ShareLinkComponent from './ShareLink.vue'

  import ShareEmbedComponent from './ShareEmbed.vue'

  export default {
    data () {
      return {
        theme: this.$select('theme'),
        share: this.$select('share'),
        show: this.$select('show'),
        episode: this.$select('episode')
      }
    },
    computed: {
      sectionStyle () {
        return {
          background: this.theme.tabs.body.section
        }
      },
      hasLink () {
        const hasShowLink = this.share.content === 'show' && this.show.link
        const hasShareLink = this.share.content !== 'show' && this.episode.link
        return hasShowLink || hasShareLink
      }
    },
    components: {
      ShareContentComponent,
      ShareChannelsComponent,
      ShareEmbedComponent,
      ShareLinkComponent
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .share-tab {
    padding: $padding 0 0 0;

    .title {
      font-weight: 500;
      margin: ($margin / 2) 0 $margin 0;
    }
  }

  .content-select {
    padding: $padding $padding 0 $padding;
  }

  .channel-select {
    padding: $padding ($padding * 2) ($padding * 2) $padding;
    text-align: center;

    .label {
      display: block;
      font-weight: 400;
    }
  }
</style>
