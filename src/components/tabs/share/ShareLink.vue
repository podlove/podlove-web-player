<template>
    <div class="input-element">
      <h4 class="title">{{ $t('SHARE.LINK') }}</h4>
      <div class="input-row input-group">
        <ButtonComponent
            class="input-button truncate"
            :data-clipboard-text="clipboardContent(reference, share.link, playtime)"
            v-clipboard
            :style="buttonStyle(theme)">
            {{ $t('SHARE.ACTIONS.COPY') }}
        </ButtonComponent>
        <input type="text" class="input-text" disabled :style="inputStyle(theme)" :value="clipboardContent(reference, share.link, playtime)" />
      </div>
      <div class="input-row">
        <div>
          <label class="input-label">
            <input type="checkbox" class="input-checkbox" :value="share.link.start" v-on:change="toggleStart(playtime)"/> {{ $t('SHARE.LABELS.START') }}
          </label>
          <input type="text" class="input-text" :style="inputStyle(theme)" :value="secondsToTime(share.link.starttime)" v-on:input="setStarttime"/>
        </div>
      </div>
    </div>
</template>

<script>
  import { debounce, get } from 'lodash'
  import store from 'store'

  import ButtonComponent from 'shared/Button.vue'

  import { addQueryParameter } from 'utils/url'
  import { secondsToTime, timeToSeconds } from 'utils/time'

  // Link
  const clipboardContent = (reference, link, playtime) => {
    const parameters = {}

    if (link.start) {
      parameters.t = secondsToTime(link.starttime)
    }

    return addQueryParameter(reference.origin, parameters)
  }

  const toggleStart = time => {
    store.dispatch(store.actions.toggleShareLinkStart())
    store.dispatch(store.actions.setShareLinkStarttime(time))
  }

  const setStarttime = debounce(input => {
    const duration = get(store.store.getState(), 'duration')
    let time = timeToSeconds(input.target.value)

    if (!time) {
      return
    }

    if (time > duration) {
      time = duration
    }

    store.dispatch(store.actions.setShareLinkStarttime(time))
  }, 1000)

  const buttonStyle = (theme) => ({
    color: theme.tabs.button.text,
    background: theme.tabs.button.background,
    'border-color': theme.tabs.input.border
  })

  const inputStyle = (theme) => ({
    'border-color': theme.tabs.input.border
  })

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
    methods: {
      secondsToTime,

      buttonStyle,
      inputStyle,

      clipboardContent,
      toggleStart,
      setStarttime
    },
    components: {
      ButtonComponent,
      inputStyle
    }
  }
</script>

<style lang="scss">
    @import 'inputs';
</style>
