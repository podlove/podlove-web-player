<template>
  <div class="error">
    <h2 class="title" :style="titleStyle">{{ $t(error.title) }}</h2>
    <div class="description" :style="descriptionStyle">{{ $t(error.message) }}</div>
  </div>
</template>

<script>
  import color from 'color'

  import ErrorIcon from 'icons/ErrorIcon.vue'

  export default {
    data () {
      return {
        poster: this.$select('poster'),
        title: this.$select('title'),
        showTitle: this.$select('showTitle'),
        subtitle: this.$select('subtitle'),
        theme: this.$select('theme'),
        error: this.$select('error')
      }
    },
    computed: {
      titleStyle () {
        return {
          color: this.theme.player.title
        }
      },
      descriptionStyle () {
        return {
          color: color(this.theme.player.text).fade(0.25)
        }
      }
    },
    components: {
      ErrorIcon
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  $error-height: 100px;

  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding-top: $padding;

    height: $error-height;

    text-align: center;
    overflow: hidden;

    .title {
      margin-top: 0;
      margin-bottom: $margin / 3;
      font-weight: inherit;
      font-size: 1.8em;
      line-height: 1em;
    }

    .description {
      margin: 0;
      font-weight: inherit;
      font-size: 1em;
      line-height: 1.2em;
    }
  }
</style>
