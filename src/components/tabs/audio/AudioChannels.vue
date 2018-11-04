<template>
  <div class="input-element" :aria-label="$t('A11Y.CHANNELS')">
    <label class="spaced" tabindex="0">
      <span class="input-label">{{ $t('AUDIO.CHANNELS') }}</span>
    </label>

    <button-group-component>
      <button-component
        id="tab-audio--channels-mono"
        @click.native="setMonoChannel"
        class="audio-channels"
        :active="mono"
        :type="mono ? 'default' : 'light'">
        {{ $t('AUDIO.MONO') }}
      </button-component>
      <button-component
        id="tab-audio--channels-stereo"
        @click.native="setStereoChannel"
        class="audio-channels"
        :active="stereo"
        :type="stereo ? 'default' : 'light'">
        {{ $t('AUDIO.STEREO') }}
      </button-component>
    </button-group-component>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'redux-vuex'

  import { selectActiveChannels } from 'store/selectors'

  import ButtonGroupComponent from 'shared/ButtonGroup'
  import ButtonComponent from 'shared/Button'

  export default {
    data: mapState({
      channels: selectActiveChannels
    }),

    methods: mapActions('setMonoChannel', 'setStereoChannel'),

    computed: {
      stereo () {
        return this.channels === 2
      },

      mono () {
        return this.channels === 1
      }
    },

    components: {
      ButtonGroupComponent,
      ButtonComponent
    }
  }
</script>

<style lang="scss">
  .audio-channels {
    font-size: 1.2em;
    font-weight: 300;
    height: 3em;
  }
</style>
