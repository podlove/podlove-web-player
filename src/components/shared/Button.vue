<template>
  <button class="podlove-player--button" @click="click()"><slot></slot></button>
</template>

<script>
  export default {
    props: ['click']
  }
</script>

<style lang="scss">
  @import 'variables';

  .podlove-player--button {
    cursor: pointer;

    background: transparent;

    border-radius: 0;
    border: 0;
    opacity: 1;
    transition: opacity $animation-duration;

    &[disabled] {
      opacity: 0.5;
    }

    &.start, &.idle, &.end, &.loading {
      opacity: 0;
    }
  }
</style>
