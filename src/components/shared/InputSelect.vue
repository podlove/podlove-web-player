<template>
  <select v-if="options" :style="style" class="input-select" :disabled="disabled" @change="changeEvent">
    <option v-for="(option, index) in options" v-bind:key="index" :selected="option === model">
      {{ option }}
    </option>
  </select>
  <select v-else :style="style" class="input-select" :disabled="disabled" @change="changeEvent">
    <slot></slot>
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
    },
    methods: {
      changeEvent (event) {
        this.change && this.change(event.target.value)
      }
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

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
