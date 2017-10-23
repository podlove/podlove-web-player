<template>
  <div class="info" v-if="hasPoster || hasShowTitle || hasEpisodeTitle || hasDescription">
    <div class="poster" v-if="hasPoster">
      <div class="poster-container" :style="posterStyle">
        <img class="poster-image" :src="episode.poster || show.poster" @error="onImageLoad">
      </div>
    </div>
    <div class="description">
      <h2 class="show-title" :style="titleStyle" v-if="hasShowTitle">
        <a :href="show.link" target="_blank" class="truncate" v-if="display === 'embed' && show.link">{{show.title}}</a>
        <span class="truncate" v-else>{{show.title}}</span>
      </h2>
      <h1 class="title" :style="titleStyle" v-if="hasEpisodeTitle">
        <a :href="episode.link" target="_blank" class="truncate" v-if="display === 'embed' && episode.link">{{episode.title}}</a>
        <span class="truncate" v-else>{{episode.title}}</span>
      </h1>
      <div class="subtitle" :style="subtitleStyle" v-if="hasDescription">{{episode.subtitle}}</div>
    </div>
  </div>
</template>

<script>
  import store from 'store'
  import color from 'color'

  export default {
    data () {
      return {
        episode: this.$select('episode'),
        show: this.$select('show'),
        theme: this.$select('theme'),
        display: this.$select('display'),
        visibleComponents: this.$select('visibleComponents'),
        components: this.$select('components')
      }
    },
    computed: {
      titleStyle () {
        return {
          color: this.theme.player.title
        }
      },
      posterStyle () {
        return {
          'border-color': this.theme.player.poster
        }
      },
      subtitleStyle () {
        return {
          color: color(this.theme.player.text).fade(0.25)
        }
      },
      hasPoster () {
        return (this.episode.poster || this.show.poster) &&
          this.visibleComponents.poster && this.components.header.poster
      },
      hasShowTitle () {
        return this.show.title && this.visibleComponents.showTitle
      },
      hasEpisodeTitle () {
        return this.episode.title && this.visibleComponents.episodeTitle
      },
      hasDescription () {
        return this.episode.subtitle && this.visibleComponents.subtitle
      }
    },
    methods: {
      onImageLoad () {
        store.dispatch(store.actions.toggleInfoPoster(false))
      }
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  $poster-size: 100px;
  $description-height: 100px;

  .info {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding-top: $padding;

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

    .title {
      margin-top: 0;
      margin-bottom: $margin / 3;
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
      height: 1.5 * 2em;
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
        height: calc(100px + 3em); // Height of description
      }
    }
  }
</style>
