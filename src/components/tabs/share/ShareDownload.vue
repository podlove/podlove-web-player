<template>
    <div class="input-element">
        <h4 class="title">{{ $t('SHARE.DOWNLOAD') }}</h4>
        <div class="input-row input-group">
            <a class="button input-button truncate"
                :href="activeAudioFile(share.download.files)"
                :style="buttonStyle">
                {{ $t('SHARE.ACTIONS.DOWNLOAD') }}
            </a>
            <input type="text" class="input-text" disabled :style="inputStyle" :value="activeAudioFile(share.download.files)" />
        </div>
        <div class="input-row" v-if="share.download.files.length > 1">
          <div></div>
          <div>
            <label class="input-label">{{ $t('SHARE.LABELS.TYPE') }}</label>
            <select class="input-select" v-on:change="switchAudioType" :style="inputStyle">
              <option v-for="option in share.download.files"
                v-bind:value="option.file"
                :selected="activeAudioType(share.download.files) === option.type">
                {{ option.type }}
              </option>
            </select>
          </div>
        </div>
    </div>
</template>

<script>
  import store from 'store'
  import { compose, find, get } from 'lodash/fp'

  import ButtonComponent from 'shared/Button.vue'

  const activeAudioFile = compose(get('file'), find({active: true}))
  const activeAudioType = compose(get('type'), find({active: true}))

  export default {
    data () {
      return {
        share: this.$select('share'),
        theme: this.$select('theme')
      }
    },
    computed: {
      buttonStyle () {
        return {
          color: this.theme.tabs.button.text,
          background: this.theme.tabs.button.background,
          'border-color': this.theme.tabs.input.border
        }
      },
      inputStyle () {
        return {
          'border-color': this.theme.tabs.input.border
        }
      }
    },
    methods: {
      activeAudioFile,
      activeAudioType,

      switchAudioType (input) {
        store.dispatch(store.actions.switchDownloadFile(input.target.value))
      }
    },
    components: {
      ButtonComponent
    }
  }
</script>

<style lang="scss">
    @import 'inputs';
</style>
