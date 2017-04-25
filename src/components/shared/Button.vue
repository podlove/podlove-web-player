<template>
  <button :style="buttonStyle(color)" class="podlove-player--button" @click="click()"><slot></slot></button>
</template>

<script>
  const buttonStyle = color => {
    if (!color) {
      return {}
    }

    return {
      'background-color': color
    }
  }

  export default {
    props: ['click', 'color'],
    methods: {
      buttonStyle
    }
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
    outline: none;

    &[disabled] {
      opacity: 0.5;
    }

    &.start, &.idle, &.end, &.loading {
      opacity: 0;
    }

    &.solid {
      color: $background-color;
      background: $accent-color;
      border-radius: 4px;
      border: 2px solid $accent-color;

      &:hover, &.active {
        color: $accent-color;
        background: $background-color;
      }
    }
  }
</style>
