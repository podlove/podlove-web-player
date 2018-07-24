<template>
  <div class="share-tab" id="tab-share">
    <div class="content-select">
      <share-content-component @onSelect="onContentSelect()"></share-content-component>
    </div>

    <div class="channel-select" :style="sectionStyle">
      <span class="label">{{ $t('SHARE.SHARE_CHANNEL') }}</span>
      <share-channels-component :type="share.content" ref="channels"></share-channels-component>

      <span class="label" v-if="hasLink">{{ $t('SHARE.SHARE_LINK') }}</span>
      <share-link-component :type="share.content" v-if="hasLink"></share-link-component>
    </div>

    <share-embed-component :type="share.content"></share-embed-component>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'
  import { head } from 'lodash'

  import ShareChannelsComponent from './ShareChannels'
  import ShareContentComponent from './ShareContent'
  import ShareLinkComponent from './ShareLink'

  import ShareEmbedComponent from './ShareEmbed'

  export default {
    data: mapState('theme', 'share', 'show', 'episode'),
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
    methods: {
      onContentSelect () {
        head(this.$refs.channels.$el.querySelectorAll('a')).focus()
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
