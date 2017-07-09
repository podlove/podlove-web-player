<template>
  <div class="info" >
    <div class="poster" v-if="episode.poster || show.poster">
      <div class="poster-container" :style="posterStyle">
        <img class="poster-image" :src="episode.poster || show.poster">
      </div>
    </div>
    <div class="description">
      <h2 class="show-title truncate" :style="titleStyle" v-if="show.title">
        <a :href="show.link" target="_blank" v-if="display === 'embed' && show.link">{{show.title}}</a>
        <span v-else>{{show.title}}</span>
      </h2>
      <h1 class="title truncate" :style="titleStyle" v-if="episode.title">
        <a :href="episode.link" target="_blank" v-if="display === 'embed' && episode.link">{{episode.title}}</a>
        <span v-else>{{episode.title}}</span>
      </h1>
      <div class="subtitle" :style="subtitleStyle" v-if="episode.subtitle">{{episode.subtitle}}</div>
    </div>
  </div>
</template>

<script>
  import color from 'color'

  export default {
    data () {
      return {
        episode: this.$select('episode'),
        show: this.$select('show'),
        theme: this.$select('theme'),
        display: this.$select('display')
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
      subtitleStyle() {
        return {
          color: color(this.theme.player.text).fade(0.25)
        }
      }
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  $poster-size: 100px;
  $description-height: 100px;

  .info {
    width: 100%;
    display: flex;
    flex-direction: row;

    .poster {
      margin: 0 $margin 0 0;
    }

    .poster-container {
      width: $poster-size;
      line-height: 0;
      border-width: 2px;
      border-style: solid;
    }

    .title {
      margin-top: 0;
      margin-bottom: $margin / 3;
      font-weight: inherit;
      font-size: 1.8em;
    }

    .show-title {
      margin: 0;
      font-weight: inherit;
      font-size: 1em;
      line-height: 1.2em;
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
        width: calc(100px + 3em); // Height of description
      }
    }
  }
</style>
