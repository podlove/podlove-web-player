<template>
  <ul class="channel-list">
    <li><ChannelTwitterComponent :text="shareText"></ChannelTwitterComponent></li>
    <li><ChannelFacebookComponent :link="shareLink"></ChannelFacebookComponent></li>
    <li><ChannelPinterestComponent :text="shareText" :link="shareLink" :poster="sharePoster"></ChannelPinterestComponent></li>
    <li><ChannelRedditComponent :text="shareText" :link="shareLink"></ChannelRedditComponent></li>
    <li><ChannelGooglePlusComponent :link="shareLink"></ChannelGooglePlusComponent></li>
    <li><ChannelMailComponent :text="shareText" :subject="shareSubject"></ChannelMailComponent></li>
    <li v-if="type !== 'show' && ((reference.config && reference.share) || reference.origin)">
      <ChannelEmbedComponent :color="theme.tabs.share.platform.button"></ChannelEmbedComponent>
    </li>
  </ul>
</template>

<script>
  import { currentChapter } from 'utils/chapters'
  import { secondsToTime } from 'utils/time'
  import { addQueryParameter } from 'utils/url'

  import ChannelTwitterComponent from './channels/ChannelTwitter.vue'
  import ChannelFacebookComponent from './channels/ChannelFacebook.vue'
  import ChannelGooglePlusComponent from './channels/ChannelGooglePlus.vue'
  import ChannelMailComponent from './channels/ChannelMail.vue'
  import ChannelEmbedComponent from './channels/ChannelEmbed.vue'
  import ChannelPinterestComponent from './channels/ChannelPinterest.vue'
  import ChannelRedditComponent from './channels/ChannelReddit.vue'

  export default {
    props: ['type'],
    data () {
      return {
        show: this.$select('show'),
        episode: this.$select('episode'),
        playtime: this.$select('playtime'),
        chapters: this.$select('chapters'),
        theme: this.$select('theme'),
        reference: this.$select('reference')
      }
    },
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
          const chapter = currentChapter(this.chapters)
          time = `${secondsToTime(chapter.start)},${secondsToTime(chapter.end)}`
        }

        if (this.type === 'time') {
          time = secondsToTime(this.playtime)
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
            chapter: currentChapter(this.chapters).title
          })
        }

        if (this.type === 'time') {
          return this.$t('SHARE.EPISODE.TEXT.PLAYTIME', {
            ...this.episode,
            link: this.shareLink,
            playtime: secondsToTime(this.playtime)
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
            chapter: currentChapter(this.chapters).title
          })
        }

        if (this.type === 'time') {
          return this.$t('SHARE.EPISODE.SUBJECT.PLAYTIME', {
            ...this.episode,
            link: this.shareLink,
            playtime: secondsToTime(this.playtime)
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
      ChannelRedditComponent
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
