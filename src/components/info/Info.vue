<template>
  <div class="podlove-info">
    <div class="podlove-info--header">
      <div class="podlove-player--download"></div>
      <div class="podlove-info--poster">
        <img class="podlove-info--poster--image" :src="poster" :style="posterStyle(theme)"/>
      </div>
      <div class="podlove-player--share"><ShareButton /></div>
    </div>
    <div class="podlover-info--description">
      <h1 class="podlove-info--title" :style="titleStyle(theme)">{{title}}</h1>
      <div class="podlove-info--subtitle" :style="subtitleStyle(theme)">{{subtitle}}</div>
    </div>
  </div>
</template>

<script>
  import store from 'store'
  import color from 'color'

  import ShareButton from '../overlays/share/ShareButton.vue'

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
    components: {
      ShareButton
    },
    methods: {
      posterStyle,
      titleStyle,
      subtitleStyle
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  $poster-size: 100px;
  $description-height: 100px;

  .podlove-info {
    padding: $padding;
    height: calc(100% - #{$player-height});
    width: 100%;
    display: flex;
    overflow: hidden;

    .podlove-info--header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }

    .podlove-info--poster {
      display: flex;
      justify-content: center;
    }

    .podlove-player--share, .podlove-player--download {
      display: none;
      justify-content: center;
    }

    .podlove-info--poster--image {
      display: block;
      height: $poster-size;
      width: auto;

      margin-right: $margin;
      border: 2px solid;
    }

    .podlover-info--description {
      padding: ($padding / 3) 0;
      max-height: $description-height;
    }

    .podlove-info--title {
      margin: 0 0 ($margin / 2) 0;
      padding: 0;

      font-size: 20px;
      font-weight: 300;
    }

    .podlove-info--subtitle {
      max-height: 3.6rem;
      font-size: 14px;
      line-height: 20px;
      font-weight: 100;
      overflow: hidden;
      position: relative;
    }


    @media screen and (max-width: $width-l) {
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .podlove-info--header {
        width: 100%;
        align-items: center;
      }

      .podlove-info--poster {
        width: 50%;
      }

      .podlove-player--share, .podlove-player--download {
        display: flex;
        width: 25%;
      }

      .podlove-info--title {
        margin-top: $margin;
      }

      .podlove-info--title, .podlove-info--subtitle {
        text-align: center;
      }
    }
  }
</style>
