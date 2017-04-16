<template>
  <div class="podlove-info" :style="backgroundStyle(theme)">
    <div class="poster" v-if="poster">
      <div class="poster-container" :style="posterStyle(theme)">
          <img class="poster-image" :src="poster" />
      </div>
    </div>
    <div class="description">
      <h2 class="show-title truncate" :style="titleStyle(theme)">{{showTitle}}</h2>
      <h1 class="title truncate" :style="titleStyle(theme)">{{title}}</h1>
      <div class="subtitle" :style="subtitleStyle(theme)">{{subtitle}}</div>
    </div>
  </div>
</template>

<script>
  import store from 'store'
  import color from 'color'

  const posterStyle = theme => ({
    'border-color': theme.player.poster
  })

  const titleStyle = theme => ({
    color: theme.player.title
  })

  const subtitleStyle = theme => ({
    color: color(theme.player.text).fade(0.25)
  })

  const backgroundStyle = theme => ({
    'background-color': theme.player.background
  })

  export default {
    data () {
      return {
        poster: this.$select('poster'),
        title: this.$select('title'),
        showTitle: this.$select('showTitle'),
        subtitle: this.$select('subtitle'),
        theme: this.$select('theme')
      }
    },
    methods: {
      posterStyle,
      titleStyle,
      subtitleStyle,
      backgroundStyle
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  $poster-size: 100px;
  $description-height: 100px;

  .podlove-info {
    padding: $padding $padding 0 $padding;
    width: 100%;
    display: flex;
    flex-direction: row;
    overflow: hidden;

    .poster {
      margin: 0 $margin 0 0;
    }

    .poster-container {
      width: $poster-size;
      border: 2px solid;
      line-height: 0;
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
      line-height: 1.2;
    }

    .subtitle {
      overflow: hidden;
      height: 1.5 * 2em; 
    }
  }

  @media screen and (max-width: $width-l) {
    .podlove-info {
      flex-direction: column;
      text-align: center;

      .poster {
        width: 100%;
        display: flex;
        margin: 0 0 $margin 0;
        justify-content: center;
      }
    }
  }
</style>
