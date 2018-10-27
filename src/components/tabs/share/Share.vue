<template>
  <div class="share-tab" id="tab-share">
    <div class="content-select">
      <share-content-component @onSelect="onContentSelect()"></share-content-component>
    </div>

    <div class="channel-select" :style="sectionStyle">
      <span class="label">{{ $t('SHARE.SHARE_CHANNEL') }}</span>
      <share-channels-component :type="content" ref="channels"></share-channels-component>

      <div class="channel-share" v-if="showLink" id="tab-share--link">
        <span class="label" >{{ $t('SHARE.SHARE_LINK') }}</span>
        <share-link-component :type="content"></share-link-component>
      </div>

      <div class="channel-share" v-if="showEmbed" id="tab-share--embed--link">
        <span class="label" >{{ $t('SHARE.EMBED.TITLE') }}</span>
        <share-embed-component :type="content"></share-embed-component>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'
  import { head } from 'lodash'
  import { selectShareContent } from 'store/selectors'

  import ShareChannelsComponent from './ShareChannels'
  import ShareContentComponent from './ShareContent'
  import ShareLinkComponent from './ShareLink'

  import ShareEmbedComponent from './ShareEmbed'

  export default {
    data: mapState({
      theme: 'theme',
      share: 'share',
      show: 'show',
      episode: 'episode',
      reference: 'reference',
      content: selectShareContent
    }),
    computed: {
      sectionStyle () {
        return {
          background: this.theme.tabs.body.section
        }
      },
      showLink () {
        const hasShowLink = this.content === 'show' && this.show.link
        const hasShareLink = this.content !== 'show' && this.episode.link
        return hasShowLink || hasShareLink
      },
      showEmbed () {
        return this.content !== 'show' && ((this.reference.config && this.reference.share) || this.reference.origin)
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

  .channel-share {
    padding: $padding 0
  }
</style>
