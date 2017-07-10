<template>
    <div class="input-element">
      <h4 class="title">{{ $t('SHARE.LINK') }}</h4>
      <div class="input-row input-group">
        <ButtonComponent
            class="input-button truncate"
            :data-clipboard-text="clipboardContent"
            v-clipboard
            :style="buttonStyle">
            {{ $t('SHARE.ACTIONS.COPY') }}
        </ButtonComponent>
        <input type="text" class="input-text" disabled :style="inputStyle" :value="clipboardContent" />
      </div>
      <div class="input-row">
        <div>
          <label class="input-label">
            <input type="checkbox" class="input-checkbox" :value="share.link.start" v-on:change="toggleStart(playtime)"/> {{ $t('SHARE.LABELS.START') }}
          </label>
          <input type="text" class="input-text" :style="inputStyle" :value="secondsToTime(share.link.starttime)" v-on:input="setStarttime"/>
        </div>
      </div>
    </div>
</template>

<script>
  import { debounce } from 'lodash'
  import store from 'store'

  import ButtonComponent from 'shared/Button.vue'

  import { addQueryParameter } from 'utils/url'
  import { secondsToTime, timeToSeconds } from 'utils/time'

  export default {
    data () {
      return {
        share: this.$select('share'),
        reference: this.$select('reference'),
        playtime: this.$select('playtime'),
        duration: this.$select('duration'),
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
      },

      clipboardContent () {
        const parameters = {}

        if (this.share.link.start) {
          parameters.t = secondsToTime(this.share.link.starttime)
        }

        return addQueryParameter(this.reference.origin, parameters)
      }
    },
    methods: {
      secondsToTime,

      setStarttime (input) {
        debounce(() => {
          let time = timeToSeconds(input.target.value)

          if (!time) {
            return
          }

          if (time > this.duration) {
            time = this.duration
          }

          store.dispatch(store.actions.setShareLinkStarttime(time))
        }, 1000)()
      },

      toggleStart (time) {
        store.dispatch(store.actions.toggleShareLinkStart())
        store.dispatch(store.actions.setShareLinkStarttime(time))
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
