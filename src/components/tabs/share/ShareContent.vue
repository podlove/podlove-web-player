<template>
  <div class="content" id="tab-share--content">
    <div
      v-if="show.link"
      tabindex="0" role="button" :aria-label="$t('A11Y.SHARE_CONTENT_SHOW', show)"
      class="content-option" id="tab-share--content--show"
      :class="{active: isActive('show')}" :style="isActive('show') ? activeContentStyle : {}"
      @click="setContent('show')">
      <share-show-icon class="icon"></share-show-icon>
      <span class="type">{{ $t('SHARE.CONTENT.SHOW') }}</span>
      <span class="title truncate">{{ show.title }}</span>
      <span class="active-indicator" :style="triangleStyle"></span>
    </div>
    <div
      tabindex="0" role="button" :aria-label="$t('A11Y.SHARE_CONTENT_EPISODE', episode)"
      class="content-option" id="tab-share--content--episode"
      :class="{active: isActive('episode')}" :style="isActive('episode') ? activeContentStyle : {}"
      @click="setContent('episode')">
      <share-episode-icon class="icon"></share-episode-icon>
      <span class="type">{{ $t('SHARE.CONTENT.EPISODE') }}</span>
      <span class="title truncate">{{ episode.title }}</span>
      <span class="active-indicator" :style="triangleStyle"></span>
    </div>
    <div
      v-if="currentChapter"
      tabindex="0" role="button" :aria-label="$t('A11Y.SHARE_CONTENT_CHAPTER', episode)"
      class="content-option" id="tab-share--content--chapter"
      :class="{active: isActive('chapter')}" :style="isActive('chapter') ? activeContentStyle : {}"
      @click="setContent('chapter')">
      <share-chapter-icon class="icon"></share-chapter-icon>
      <span class="type">{{ $t('SHARE.CONTENT.CHAPTER') }}</span>
      <span class="title truncate">{{ currentChapter }}</span>
      <span class="active-indicator" :style="triangleStyle"></span>
    </div>
    <div
      tabindex="0" role="button" :aria-label="$t('A11Y.SHARE_CONTENT_PLAYTIME', { playtime: fromPlayerTime(playtime) })"
      class="content-option" id="tab-share--content--time"
      :class="{active: isActive('time')}" :style="isActive('time') ? activeContentStyle : {}"
      @click="setContent('time')">
      <share-playtime-icon class="icon"></share-playtime-icon>
      <span class="type">{{ $t('SHARE.CONTENT.TIME') }}</span>
      <span class="title truncate">{{ fromPlayerTime(playtime) }}</span>
      <span class="active-indicator" :style="triangleStyle"></span>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'redux-vuex'
  import selectors from 'store/selectors'

  import { get } from 'lodash'
  import { fromPlayerTime } from 'utils/time'

  import ShareShowIcon from 'icons/ShareShowIcon'
  import ShareEpisodeIcon from 'icons/ShareEpisodeIcon'
  import ShareChapterIcon from 'icons/ShareChapterIcon'
  import SharePlaytimeIcon from 'icons/SharePlaytimeIcon'

  export default {
    data: mapState({
      share: 'share',
      theme: 'theme',
      episode: 'episode',
      show: 'show',
      currentChapter: selectors.selectCurrentChapterTitle,
      playtime: 'playtime'
    }),
    computed: {
      activeContentStyle () {
        return {
          background: this.theme.tabs.share.content.active.background,
          color: this.theme.tabs.share.content.active.color
        }
      },

      triangleStyle () {
        return {
          'border-color': `${this.theme.tabs.share.content.active.background} transparent transparent transparent`
        }
      }
    },
    methods: {
      ...mapActions({
        setContent: function ({ dispatch, actions }, type) {
          dispatch(actions.setShareContent(type))
          this.$emit('onSelect')
        }
      }),

      isActive (type) {
        return this.share.content === type
      },

      fromPlayerTime
    },
    components: {
      ShareShowIcon,
      ShareEpisodeIcon,
      ShareChapterIcon,
      SharePlaytimeIcon
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .content {
    display: flex;
    justify-content: center;

    .content-option {
      display: flex;
      flex-direction: column;
      align-items: center;

      text-align: center;

      position: relative;
      cursor: pointer;

      width: $content-option-width;
      margin: 0 $margin;
      padding: $padding ($padding / 2);

      .cover {
        width: 100%;
        height: auto;
        margin-bottom: $margin;
      }

      .icon {
        margin-bottom: $margin / 2;
      }

      .type {
        text-transform: uppercase;
      }

      .title {
        margin-bottom: $margin / 2;
        display: block;
        width: 100%;
      }

      .active-indicator {
        display: none;
        position: absolute;
        bottom: #{$padding / -2};
        left: 50%;
        margin-left: #{$padding / -2};
        width: 0;
        height: 0;
        border-style: solid;
        border-width: ($padding / 2) ($padding / 2) 0 ($padding / 2);
      }

      &.active .active-indicator {
        display: block;
      }
    }
  }

   @media screen and (max-width: $width-l) {
    .content {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;

      .content-option .active-indicator {
        display: none;
      }
    }
  }
</style>
