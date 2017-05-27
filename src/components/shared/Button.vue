<template>
  <button :style="buttonStyle(color)" class="button" @click="click && click()"><slot></slot></button>
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

  .button {
    cursor: pointer;

    background: transparent;

    border-radius: 0;
    border: 0;
    outline: none;

    &[disabled] {
      opacity: 0.5;
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
