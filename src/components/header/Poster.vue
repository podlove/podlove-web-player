<template>
  <div class="poster" id="header-poster">
    <div class="poster-container" :style="posterStyle">
      <img class="poster-image" :src="posterSrc" :alt="alternativeText" @error="onImageLoad">
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'redux-vuex'
  import selectors from 'store/selectors'

  export default {
    data: mapState({
      theme: 'theme',
      episode: 'episode',
      show: 'show',
      components: 'components',
      visibleComponents: 'visibleComponents',
      chapterPoster: selectors.selectCurrentChapterImage,
      playtime: 'playtime'
    }),
    computed: {
      posterStyle () {
        return {
          'border-color': this.theme.player.poster
        }
      },
      posterSrc () {
        if (this.playtime === 0) {
          return this.episode.poster || this.show.poster
        }

        return this.chapterPoster || this.episode.poster || this.show.poster
      },
      alternativeText () {
        if (this.episode.poster) {
          return this.$t('A11Y.ALT_EPISODE_COVER')
        }

        if (this.show.poster) {
          return this.$t('A11Y.ALT_SHOW_COVER')
        }
      }
    },
    methods: mapActions({
      onImageLoad: ({ dispatch, actions }) => {
        dispatch(actions.toggleInfoPoster(false))
      }
    }),
  }
</script>

<style lang="scss">
  @import '~styles/variables';
  .poster {
    margin: 0 $margin 0 0;
  }

  .poster-container {
    height: $poster-size;
    line-height: 0;
    border-width: 2px;
    border-style: solid;

    .poster-image {
      max-height: 100%;
      max-width: none;
      width: auto;
    }
  }
</style>

