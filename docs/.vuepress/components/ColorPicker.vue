<template>
  <div class="container">
    <podlove-web-player :config="config" @ready="onReady"/>

    <div class="row">
      <div class="column">
        <h4>Main</h4>
        <picker v-model="main" />
      </div>
      <div class="column">
        <h4>Highlight</h4>
        <picker v-model="highlight" />
      </div>
    </div>
  </div>
</template>

<script>
  import { Chrome } from 'vue-color'
  import PodloveWebPlayer from './PodloveWebPlayer.vue'

  export default {
    props: ['config'],
    name: 'ColorPicker',
    data() {
      return {
        main: '#2B8AC6',
        highlight: '#FFFFFF'
      }
    },
    components: {
      'picker': Chrome,
      PodloveWebPlayer
    },
    methods: {
      onReady (store) {
        this.store = store
        this.updateColors()
      },

      updateColors () {
        const main = this.main.hex8
        const highlight = this.highlight.hex8

        this.store.dispatch({
          type: 'SET_THEME',
          payload: {
            main,
            highlight
          }
        })
      }
    },
    watch: {
      main () {
        this.updateColors()
      },

      highlight () {
        this.updateColors()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .row {
    margin-bottom: 1.5em;
  }
</style>

