<template>
  <div class="info" id="header-info" v-if="hasPoster || hasShowTitle || hasEpisodeTitle || hasDescription">
    <poster-component v-if="hasPoster"></poster-component>
    <div class="description">
      <h2 class="show-title" :style="titleStyle" v-if="hasShowTitle" id="header-showtitle">
        <a :href="show.link" target="_blank" class="truncate" v-if="show.link">{{ show.title }}</a>
        <span class="truncate" v-else>{{ show.title }}</span>
      </h2>
      <h1 class="title" v-marquee :style="titleStyle" v-if="hasEpisodeTitle" id="header-title">
        <a :href="episode.link" target="_blank" v-if="episode.link">{{ episode.title }}</a>
        <span v-else>{{ episode.title }}</span>
      </h1>
      <h3 class="subtitle" :style="subtitleStyle" v-if="hasDescription" id="header-subtitle">{{ episode.subtitle }}</h3>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'redux-vuex'
  import selectors from 'store/selectors'

  import color from 'color'
  import PosterComponent from './Poster'

  export default {
    data: mapState({
      episode: 'episode',
      show: 'show',
      theme: 'theme',
      display: 'display',
      visibleComponents: 'visibleComponents',
      components: 'components',
      chapterPoster: selectors.selectCurrentChapterImage
    }),
    computed: {
      titleStyle () {
        return {
          color: this.theme.player.title
        }
      },
      subtitleStyle () {
        return {
          color: color(this.theme.player.text).fade(0.25)
        }
      },
      hasShowTitle () {
        return this.show.title && this.visibleComponents.showTitle
      },
      hasEpisodeTitle () {
        return this.episode.title && this.visibleComponents.episodeTitle
      },
      hasDescription () {
        return this.episode.subtitle && this.visibleComponents.subtitle
      },
      hasPoster () {
        return (this.episode.poster || this.show.poster || this.chapterPoster) &&
          this.visibleComponents.poster && this.components.header.poster
      },
    },
    components: {
      PosterComponent
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .info {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding-top: $padding;

    .title {
      margin-top: 0;
      margin-bottom: $margin / 4;
      font-weight: inherit;
      font-size: 1.8em;

      a, span {
        display: block;
      }
    }

    .show-title {
      margin: 0;
      font-weight: inherit;
      font-size: 1em;
      line-height: 1.2em;
      min-width: 0;

      a, span {
        display: block;
      }
    }

    .description {
      width: 100%;
      max-width: 100%;
      overflow: hidden;
    }

    .subtitle {
      overflow: hidden;
      margin: 0;
      height: 2.75em;
      line-height: 1.3em;
      font-size: 1.1em;
      font-weight: 100;
      hyphens: auto;
    }
  }

  @media screen and (max-width: $width-m) {
    .info {
      flex-direction: column;
      text-align: center;

      .poster {
        width: 100%;
        display: flex;
        margin: 0 0 $margin 0;
        justify-content: center;
      }

      .poster-container {
        height: calc(#{$poster-size} + 3em); // Height of description
      }
    }
  }
</style>
