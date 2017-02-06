<template>
  <div class="podlove-header" :style="headerStyle(theme)">
    <img class="podlove-header--poster" :src="poster" :style="posterStyle(theme)"/>
    <div class="podlover-header--info">
      <h1 class="podlove-header--title" :style="titleStyle(theme)">{{title}}</h1>
      <div class="podlove-header--subtitle" :style="subtitleStyle(theme)">{{subtitle}}</div>
    </div>
  </div>
</template>

<script>
  import store from 'store'
  import color from 'color'

  const headerStyle = theme => ({
    'background-color': theme.player.background
  })

  const posterStyle = theme => ({
    'border-color': theme.player.poster
  })

  const titleStyle = theme => ({
    color: theme.player.title
  })

  const subtitleStyle = theme => ({
    color: color(theme.player.text).fade(0.25)
  })

  export default {
    data () {
      return {
        poster: this.$select('poster'),
        title: this.$select('title'),
        subtitle: this.$select('subtitle'),
        theme: this.$select('theme')
      }
    },
    methods: {
      headerStyle,
      posterStyle,
      titleStyle,
      subtitleStyle
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  $poster-size: 100px;

  .podlove-header {
    padding: $padding;

    width: 100%;
    display: flex;

    .podlove-header--poster {
      display: block;

      height: $poster-size;
      width: auto;

      margin-right: $margin;
      border: 2px solid;
    }

    .podlover-header--info {
      padding: ($padding / 3) 0;
      max-height: $poster-size;
    }

    .podlove-header--title {
      margin: 0 0 ($margin / 2) 0;
      padding: 0;

      font-size: 1.2rem;
      font-weight: 300;
    }

    .podlove-header--subtitle {
      max-height: 3.6rem;
      font-size: 0.9rem;
      line-height: 1.2rem;
      font-weight: 100;
      overflow: hidden;
      position: relative;
    }

    @media screen and (max-width: $width-l) {
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .podlove-header--title {
        margin-top: $margin;
      }

      .podlove-header--title, .podlove-header--subtitle {
        text-align: center;
      }
    }
  }
</style>
