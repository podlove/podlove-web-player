<template>
  <select :style="style" class="input-select" :disabled="disabled" v-model="model">
    <option v-for="(option, index) in options" v-bind:key="index">
      {{ option }}
    </option>
  </select>
</template>

<script>
  export default {
    props: ['change', 'disabled', 'options', 'model'],
    data () {
      return {
        theme: this.$select('theme')
      }
    },
    computed: {
      style () {
        return {
          color: this.theme.input.color,
          background: this.theme.input.background,
          'border-color': this.theme.input.border
        }
      }
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  .input-select {
    display: block;
    width: 100%;

    border-width: 1px;
    border-style: solid;
    border-radius: 0;
    padding: $padding / 4;
    height: $input-height;
  }
</style>
