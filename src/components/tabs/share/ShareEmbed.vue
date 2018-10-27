<template>
    <div class="share-embed" id="share-tab--share-embed">
      <input-group-component>
        <copy-tooltip-component slot="button" :content="embedCode">
          <button-component class="truncate">
            <span aria-hidden="true">{{ $t('SHARE.ACTIONS.COPY') }}</span>
            <span class="visually-hidden">{{ $t('A11Y.COPY_SHARE_LINK') }}</span>
          </button-component>
        </copy-tooltip-component>
        <input-select-component slot="input" :model="share.embed.size" :options="share.embed.available" :change="setEmbedSize" id="tab-share--share-embed--size"></input-select-component>
        <input-text-component slot="input" disabled="true" :value="embedCode" id="tab-share--share-embed--input"></input-text-component>
      </input-group-component>
    </div>
</template>

<script>
  import { mapState, mapActions } from 'redux-vuex'
  import { selectCurrentChapter } from 'store/selectors'

  import { addQueryParameter } from 'utils/url'
  import { fromPlayerTime } from 'utils/time'

  import OverlayComponent from 'shared/Overlay'
  import ButtonComponent from 'shared/Button'
  import InputSelectComponent from 'shared/InputSelect'
  import InputTextComponent from 'shared/InputText'
  import InputGroupComponent from 'shared/InputGroup'
  import CopyTooltipComponent from 'shared/CopyTooltip'

  export default {
    props: ['type'],
    data: mapState({
      show: 'show',
      episode: 'episode',
      share: 'share',
      reference: 'reference',
      theme: 'theme',
      currentChapter: selectCurrentChapter,
      playtime: 'playtime'
    }),
    computed: {
      buttonStyle () {
        return {
          color: this.theme.tabs.button.text,
          background: this.theme.tabs.button.background,
          'border-color': this.theme.tabs.button.background
        }
      },

      buttonActiveStyle () {
        return {
          color: this.theme.tabs.button.background,
          background: this.theme.tabs.button.text,
          'border-color': this.theme.tabs.button.background
        }
      },

      inputStyle () {
        return {
          'border-color': this.theme.tabs.input.border
        }
      },

      embedCode () {
        const [width, height] = this.share.embed.size.split('x')

        const title = `Podlove Web Player:${this.show.title ? ' ' + this.show.title : ''}${this.episode.title ? ' - ' + this.episode.title : ''}`
        const parameters = {
          episode: this.reference.config
        }

        if (this.type === 'chapter') {
          const { start, end } = this.currentChapter
          parameters.t = `${fromPlayerTime(start)},${fromPlayerTime(end)}`
        }

        if (this.type === 'time') {
          parameters.t = fromPlayerTime(this.playtime)
        }

        return `<iframe title="${title}" width="${width}" height="${height}" src="${addQueryParameter(this.reference.share, parameters)}" frameborder="0" scrolling="no" tabindex="0"></iframe>`
      }
    },
    methods: {
      fromPlayerTime,
      ...mapActions({
        setEmbedSize: 'setShareEmbedSize',
        closeEmbedOverlay: 'hideShareEmbed'
      })
    },
    components: {
      OverlayComponent,
      ButtonComponent,
      InputSelectComponent,
      InputTextComponent,
      InputGroupComponent,
      CopyTooltipComponent
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .embed-code {
    width: 100%;
    display: block;
    margin: ($margin / 2) 0;
  }

  .embed-overlay {
    .overlay {
      width: $share-embed-width;
    }
  }

</style>
