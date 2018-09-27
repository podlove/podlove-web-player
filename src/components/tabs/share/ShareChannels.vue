<template>
  <ul class="channel-list" id="tab-share--channels">
    <li id="tab-share--channels--twitter"><channel-twitter-component :text="shareText"></channel-twitter-component></li>
    <li id="tab-share--channels--facebook"><channel-facebook-component :link="shareLink"></channel-facebook-component></li>
    <li id="tab-share--channels--pinterest"><channel-pinterest-component :text="shareText" :link="shareLink" :poster="sharePoster"></channel-pinterest-component></li>
    <li id="tab-share--channels--reddit"><channel-reddit-component :text="shareText" :link="shareLink"></channel-reddit-component></li>
    <li id="tab-share--channels--google-plus"><channel-google-plus-component :link="shareLink"></channel-google-plus-component></li>
    <li id="tab-share--channels--mail"><channel-mail-component :text="shareText" :subject="shareSubject"></channel-mail-component></li>
    <li id="tab-share--channels--linkedin"><channel-linkedin-component :text="shareText" :link="shareLink"></channel-linkedin-component></li>
    <li id="tab-share--channels--embed" v-if="type !== 'show' && ((reference.config && reference.share) || reference.origin)">
      <channel-embed-component :color="theme.tabs.share.platform.button"></channel-embed-component>
    </li>
  </ul>
</template>

<script>
  import { mapState } from 'redux-vuex'
  import selectors from 'store/selectors'

  import { fromPlayerTime } from 'utils/time'
  import { addQueryParameter } from 'utils/url'

  import ChannelTwitterComponent from './channels/ChannelTwitter'
  import ChannelFacebookComponent from './channels/ChannelFacebook'
  import ChannelGooglePlusComponent from './channels/ChannelGooglePlus'
  import ChannelMailComponent from './channels/ChannelMail'
  import ChannelEmbedComponent from './channels/ChannelEmbed'
  import ChannelPinterestComponent from './channels/ChannelPinterest'
  import ChannelRedditComponent from './channels/ChannelReddit'
  import ChannelLinkedinComponent from './channels/ChannelLinkedin'

  export default {
    props: ['type'],
    data: mapState({
      show: 'show',
      episode: 'episode',
      playtime: 'playtime',
      currentChapter: selectors.selectCurrentChapter,
      theme: 'theme',
      reference: 'reference'
    }),
    computed: {
      shareLink () {
        let time

        if (this.type === 'show') {
          return this.show.link
        }

        if (this.type === 'episode') {
          return this.episode.link
        }

        if (this.type === 'chapter') {
          const { start, end } = this.currentChapter
          time = `${fromPlayerTime(start)},${fromPlayerTime(end)}`
        }

        if (this.type === 'time') {
          time = fromPlayerTime(this.playtime)
        }

        return addQueryParameter(this.episode.link, { t: time })
      },

      shareText () {
        if (this.type === 'show') {
          return this.$t('SHARE.SHOW.TEXT', {
            ...this.show,
            link: this.shareLink
          })
        }

        if (this.type === 'chapter') {
          return this.$t('SHARE.EPISODE.TEXT.CHAPTER', {
            ...this.episode,
            link: this.shareLink,
            chapter: this.currentChapter.title
          })
        }

        if (this.type === 'time') {
          return this.$t('SHARE.EPISODE.TEXT.PLAYTIME', {
            ...this.episode,
            link: this.shareLink,
            playtime: fromPlayerTime(this.playtime)
          })
        }

        return this.$t('SHARE.EPISODE.TEXT.BEGINNING', {
          ...this.episode,
          link: this.shareLink
        })
      },

      shareSubject () {
        if (this.type === 'show') {
          return this.$t('SHARE.SHOW.SUBJECT', {
            ...this.show,
            link: this.shareLink
          })
        }

        if (this.type === 'chapter') {
          return this.$t('SHARE.EPISODE.SUBJECT.CHAPTER', {
            ...this.episode,
            link: this.shareLink,
            chapter: this.currentChapter.title
          })
        }

        if (this.type === 'time') {
          return this.$t('SHARE.EPISODE.SUBJECT.PLAYTIME', {
            ...this.episode,
            link: this.shareLink,
            playtime: fromPlayerTime(this.playtime)
          })
        }

        return this.$t('SHARE.EPISODE.SUBJECT.BEGINNING', {
          ...this.episode,
          link: this.shareLink
        })
      },

      sharePoster () {
        if (this.type === 'show') {
          return this.show.poster
        }

        return this.episode.poster
      }
    },
    components: {
      ChannelTwitterComponent,
      ChannelFacebookComponent,
      ChannelGooglePlusComponent,
      ChannelMailComponent,
      ChannelEmbedComponent,
      ChannelPinterestComponent,
      ChannelRedditComponent,
      ChannelLinkedinComponent
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .channel-list {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    list-style: none;
    margin: 0 0 $margin /2 0;
    padding: 0;
  }
</style>
