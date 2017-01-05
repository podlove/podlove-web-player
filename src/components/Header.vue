<template>
  <div class="podlove-header">
    <img class="podlove-header--poster" :src="poster" />
    <div class="podlover-header--info">
      <h1 class="podlove-header--title">{{title}}</h1>
      <div class="podlove-header--subtitle">{{subtitle}}</div>
    </div>
  </div>
</template>

<script>
  import store from 'store'

  export default {
    data () {
      return {
        poster: this.$select('poster'),
        title: this.$select('title'),
        subtitle: this.$select('subtitle')
      }
    }
  }
</script>

<style lang="scss">
  @import '../styles/variables';
  @import '../styles/themes/ocean';

  $poster-size: 100px;

  .podlove-header {
    padding: $padding;

    width: 100%;
    display: flex;

    background-color: $primary-color;

    .podlove-header--poster {
      display: block;

      height: $poster-size;
      width: auto;

      margin-right: $margin;

      border: 2px solid $secondary-color;
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
      color: $secondary-color;
    }

    .podlove-header--subtitle {
      overflow: hidden;
      text-overflow: ellipsis;

      font-size: 0.9rem;
      font-weight: 100;
      color: rgba($secondary-color, 0.8);
    }
  }
</style>
