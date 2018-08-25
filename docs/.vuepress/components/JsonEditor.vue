<template>
  <div class="editor-container" :style="{ height: height || '150px' }"></div>
</template>

<script>
  export default {
    name: 'json-editor',
    props: ['json', 'height', 'mode'],
    methods: {
      onChange (text) {
        try {
          this.$emit('update', JSON.parse(text))
        } catch (e) {}
      }
    },
    mounted () {
      import('jsoneditor/dist/jsoneditor.min').then(Editor => {
        this.editor = new Editor.default(this.$el, {
          search: false,
          onChangeText: this.onChange.bind(this),
          sortObjectKeys: false,
          mode: this.mode || 'code',
          statusBar: false
        })

        this.$emit('ready', this.editor)
        this.editor.set(this.json)
      })
    },
    beforeDestroy() {
      this.editor && this.editor.destroy()
      this.editor = null
    }
  }
</script>

<style lang="scss">
  @import '~jsoneditor/dist/jsoneditor.min.css';
  @import '~milligram-scss/src/Color';

  .jsoneditor {
    border-color: $color-primary !important;
    margin-bottom: 1.5em;
  }

  .jsoneditor-menu {
    display: none;
  }

  .ace_editor {
    position: static;
  }
</style>
