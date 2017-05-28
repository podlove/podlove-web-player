<template>
    <div class="input-element">
        <h4 class="title">{{ $t('SHARE.DOWNLOAD') }}</h4>
        <div class="input-row input-group">
            <input type="text" class="input-text" disabled :value="activeAudioFile(share.download.files)" />
            <a class="button input-button truncate"
                :href="activeAudioFile(share.download.files)"
                :style="buttonStyle(theme)">
                {{ $t('SHARE.ACTIONS.DOWNLOAD') }}
            </a>
        </div>
        <div class="input-row" v-if="share.download.files.length > 1">
          <div></div>
          <div>
            <label class="input-label">{{ $t('SHARE.LABELS.TYPE') }}</label>
            <select class="share-input" v-on:change="switchAudioType">
              <option v-for="option in share.download.files" v-bind:value="option.file" :selected="activeAudioType(share.download.files) === option.type">
                {{ option.type }}
              </option>
            </select>
          </div>
        </div>
    </div>
</template>

<script>
    import { compose, find, get } from 'lodash/fp'
    import store from 'store'

    import ButtonComponent from 'shared/Button.vue'

    import { addQueryParameter } from 'utils/url'

    const buttonStyle = (theme) => ({
        color: theme.tabs.button.text,
        background: theme.tabs.button.background
    })

    const activeAudioFile = compose(get('file'), find({active: true}))
    const activeAudioType = compose(get('type'), find({active: true}))

    const switchAudioType = (input) => {
      store.dispatch(store.actions.switchDownloadFile(input.target.value))
    }

    export default {
        data() {
            return {
                share: this.$select('share'),
                theme: this.$select('theme')
            }
        },
        methods: {
            buttonStyle,
            activeAudioFile,
            activeAudioType,
            switchAudioType
        },
        components: {
            ButtonComponent
        }
    }
</script>

<style lang="scss">
    @import 'inputs';
</style>
