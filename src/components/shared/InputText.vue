<template>
  <input class="input-text" :disabled="disabled" :value="value" :style="style"></input>
</template>

<script>
  export default {
    props: ['disabled', 'options', 'value'],
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
  @import '~styles/variables';

  .input-text {
    display: inline-block;
    resize: none;
    padding: $padding / 4;
    border-style: solid;
    border-width: 1px;
    border-radius: 3px;
    height: $input-height;
    font-size: 1em;

    &.block {
      display: block;
      width: 100%;
    }
  }

</style>
