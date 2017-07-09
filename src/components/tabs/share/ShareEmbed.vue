<template>
    <div class="embed input-element">
      <h4 class="title">{{ $t('SHARE.EMBED') }}</h4>
      <div class="input-row input-group">
        <ButtonComponent
          class="input-button truncate"
          :data-clipboard-text="clipboardContent"
          v-clipboard
          :style="buttonStyle">
          {{ $t('SHARE.ACTIONS.COPY') }}
        </ButtonComponent>
        <input type="text" class="input-text" :style="inputStyle" disabled :value="clipboardContent" />
      </div>
      <div class="input-row">
        <div class="share-config--time">
          <label class="input-label"><input type="checkbox" class="input-checkbox" :value="share.embed.start" v-on:change="toggleEmbedStart(playtime)"/> {{ $t('SHARE.LABELS.START') }}</label>
          <input type="text" class="input-text" :style="inputStyle" :value="secondsToTime(share.embed.starttime)" v-on:input="setStarttime"/>
        </div>
        <div class="share-config--size">
          <label class="input-label">{{ $t('SHARE.LABELS.SIZE') }}</label>
          <select class="input-select" :style="inputStyle" v-model="share.embed.size" v-on:change="setEmbedSize(share.embed.size)">
            <option v-for="option in share.embed.availableSizes" v-bind:value="option">
              {{ option }}
            </option>
          </select>
        </div>
      </div>
    </div>
</template>

<script>
  import { debounce } from 'lodash'
  import { addQueryParameter } from 'utils/url'

  import store from 'store'
  import { secondsToTime, timeToSeconds } from 'utils/time'

  import ButtonComponent from 'shared/Button.vue'

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
        const [width, height] = this.share.embed.size.split('x')

        const parameters = {
          episode: this.reference.config
        }

        if (this.share.embed.start) {
          parameters.t = secondsToTime(this.share.embed.starttime)
        }

        return `<iframe width="${width}" height="${height}" src="${addQueryParameter(this.reference.share, parameters)}" frameborder="0" scrolling="no"></iframe>`
      }
    },
    methods: {
      secondsToTime,

      setEmbedSize (size) {
        store.dispatch(store.actions.setShareEmbedSize(size))
      },

      toggleEmbedStart (time) {
        store.dispatch(store.actions.toggleShareEmbedStart())
        store.dispatch(store.actions.setShareEmbedStarttime(time))
      },

      setStarttime (input) {
        debounce(() => {
          let time = timeToSeconds(input.target.value)

          if (!time) {
            return
          }

          if (time > this.duration) {
            time = this.duration
          }

          store.dispatch(store.actions.setShareEmbedStarttime(time))
        }, 1000)()
      }
    },
    components: {
      ButtonComponent
    }
  }
</script>

<style lang="scss">
  @import 'variables';
  @import 'utils';
  @import 'inputs';

  .embed {
    @media screen and (max-width: $width-m) {
      .share-config--time, .share-config--size {
        .input-label {
          display: block;
          height: auto;
        }
      }
    }
  }
</style>
