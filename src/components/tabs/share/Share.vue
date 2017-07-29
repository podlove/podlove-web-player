<template>
  <div class="share">
    <div class="content-select">
      <ShareContentComponent></ShareContentComponent>
    </div>

    <div class="channel-select" :style="channelStyle">
      <span class="label">{{ $t('SHARE.SHARE_CHANNEL') }}</span>
      <ShareChannelsComponent :type="share.content"></ShareChannelsComponent>

      <span class="label">{{ $t('SHARE.SHARE_LINK') }}</span>
      <ShareLinkComponent :type="share.content"></ShareLinkComponent>
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
        share: this.$select('share')
      }
    },
    computed: {
      channelStyle () {
        return {
          background: this.theme.tabs.share.platform.background
        }
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
  @import 'variables';

  .share {
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
