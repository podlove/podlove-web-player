<template>
  <div>
    <podlove-web-player :config="example" @ready="initPlayer" />
    <json-editor @ready="initEditor" :json="{}" />
  </div>
</template>

<script>
  import example from '../public/fixtures/example.json'

  export default {
    name: 'store-subscribe',

    data () {
      return {
        example,
        editor: null
      }
    },

    methods: {
      initPlayer (store) {

        store.subscribe(() => {
          const { lastAction } = store.getState()

          this.editor && this.editor.set(lastAction)
        })
      },

      initEditor (editor) {
        this.editor = editor
      }
    }
  }
</script>
