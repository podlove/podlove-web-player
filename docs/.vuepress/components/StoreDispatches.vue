<template>
  <div>
    <podlove-web-player @ready="initPlayer" :config="action.payload" />

    <h4>Type</h4>
    <select v-model="type">
      <option v-for="(action, index) in actions" :key="index" :value="action.type">{{ action.type }} - {{ action.description }}</option>
    </select>

    <h4>Example Payload</h4>
    <json-editor class="editor" @ready="initEditor" @update="updateAction" :json="action" />

    <button class="dispatch-button" @click="dispatch()">Dispatch</button>
  </div>
</template>

<script>
  import example from '../public/fixtures/example.json'

  const actions = [{
    type: 'INIT',
    description: 'Initializes Player',
    payload: example
  }, {
    type: 'UI_PLAY',
    description: 'Plays Podcast',
    payload: {}
  }, {
    type: 'UI_PAUSE',
    description: 'Pauses Podcast',
    payload: {}
  }, {
    type: 'UI_RESTART',
    description: 'Restarts the podcast',
    payload: {}
  }, {
    type: 'SET_THEME',
    description: 'Sets Player Theme',
    payload: {
      main: '#9b4dca',
      highlight: '#ffffff'
    }
  }, {
    type: 'NEXT_CHAPTER',
    description: 'Jumps to the next chapter',
    payload: {}
  }, {
    type: 'PREVIOUS_CHAPTER',
    description: 'Jumps to the previous chapter',
    payload: {}
  }, {
    type: 'SET_CHAPTER',
    description: 'Jumps to a chapter index (starting from 1)',
    payload: 5
  }, {
    type: 'SET_DURATION',
    description: 'Sets the duration in milliseconds',
    payload: 10 * 1000 * 60
  }, {
    type: 'MUTE',
    description: 'Mutes the audio',
    payload: {}
  }, {
    type: 'UNMUTE',
    description: 'Unmutes the audio',
    payload: {}
  }, {
    type: 'SET_VOLUME',
    description: 'Sets the volume (between 0 and 1)',
    payload: 0.5
  }, {
    type: 'SET_RATE',
    description: 'Sets the playback rate (between 0.5 and 4)',
    payload: 1.5
  }, {
    type: 'UPDATE_PLAYTIME',
    description: 'Updates the playback time in milliseconds',
    payload: 10 * 1000 * 60
  }, {
    type: 'TOGGLE_COMPONENT_INFO',
    description: 'Shows/Hides the info section',
    payload: true
  }, {
    type: 'TOGGLE_COMPONENT_INFO_POSTER',
    description: 'Shows/Hides the info poster section',
    payload: true
  }, {
    type: 'TOGGLE_COMPONENT_CONTROLS_CHAPTERS',
    description: 'Shows/Hides the chapter controls',
    payload: true
  }, {
    type: 'TOGGLE_COMPONENT_CONTROLS_STEPPERS',
    description: 'Shows/Hides the stepper controls',
    payload: true
  }, {
    type: 'TOGGLE_COMPONENT_TAB',
    description: 'Shows/Hides a tab',
    payload: {
      tab: 'download',
      visibility: false
    }
  }, {
    type: 'TOGGLE_COMPONENT_VOLUME_SLIDER',
    description: 'Shows/Hides the volume slider',
    payload: true
  }, {
    type: 'TOGGLE_COMPONENT_RATE_SLIDER',
    description: 'Shows/Hides the rate slider',
    payload: true
  }, {
    type: 'TOGGLE_COMPONENT_PROGRESSBAR',
    description: 'Shows/Hides the progress bar',
    payload: true
  }, {
    type: 'TOGGLE_COMPONENT_CONTROLS_BUTTON',
    description: 'Shows/hides the control button unit',
    payload: true
  }]

  export default {
    data () {
      return {
        store: null,
        editor: null,
        actions,
        action: {
          type: 'INIT',
          payload: example
        },
        type: 'INIT'
      }
    },

    watch: {
      type (val) {
        const { payload, type } = this.actions.find(({ type }) => type === val)

        this.action = { type, payload }

        this.updateEditor()
      }
    },

    methods: {
      initPlayer (store) {
        this.store = store
      },

      initEditor (editor) {
        this.editor = editor
      },

      updateEditor () {
        this.editor.set(this.action)
      },

      updateAction (action) {
        this.action = action
      },

      dispatch() {
        this.store.dispatch(this.action)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .editor {
    margin-bottom: 1em;
  }

  .dispatch-button {
    display: block;
    width: 100%;
    margin-bottom: 1em;
  }
</style>

