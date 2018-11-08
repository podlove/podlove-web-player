<template>
  <div class="button-group">
    <slot></slot>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
  .button-group {
    width: 100%;
    display: flex;

    .input-button {
      border-radius: 0;
      width: 100%;
      border-right-width: 0;
    }

    .input-button:first-child {
      border-radius: 4px 0 0 4px;
    }

    .input-button:last-child {
      border-radius: 0 4px 4px 0;
      border-right-width: 1px;
    }
  }
</style>
