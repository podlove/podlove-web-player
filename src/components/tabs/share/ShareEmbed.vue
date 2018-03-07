<template>
    <overlay-component :visible="share.embed.visible" :onClose="closeEmbedOverlay" class="embed-overlay">
      <h3 name="header" class="title text-center">{{ $t('SHARE.EMBED.TITLE') }}</h3>
      <div class="input-element">
        <label class="input-label">{{ $t('SHARE.EMBED.LABEL.SIZE') }}</label>
        <input-select-component :model="share.embed.size" :options="share.embed.available" :change="setEmbedSize"></input-select-component>
      </div>
      <div class="input-element">
        <label class="input-label">{{ $t('SHARE.EMBED.LABEL.CODE') }}</label>
        <input-text-component class="block" disabled="true" :value="embedCode"></input-text-component>
      </div>
      <div class="input-element">
        <button-component class="block action" :data-clipboard-text="embedCode" v-clipboard>{{ $t('SHARE.EMBED.ACTIONS.COPY') }}</button-component>
      </div>
    </overlay-component>
</template>

<script>
  import { compose } from 'lodash/fp'
  import { addQueryParameter } from 'utils/url'
  import { fromPlayerTime } from 'utils/time'
  import { currentChapter } from 'utils/chapters'

  import store from 'store'

  import OverlayComponent from 'shared/Overlay'
  import ButtonComponent from 'shared/Button'
  import InputSelectComponent from 'shared/InputSelect'
  import InputTextComponent from 'shared/InputText'

  export default {
    props: ['type'],
    data () {
      return {
        share: this.$select('share'),
        reference: this.$select('reference'),
        theme: this.$select('theme'),
        chapters: this.$select('chapters'),
        playtime: this.$select('playtime')
      }
    },
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

        const parameters = {
          episode: this.reference.config
        }

        if (this.type === 'chapter') {
          const chapter = currentChapter(this.chapters)
          parameters.t = `${fromPlayerTime(chapter.start)},${fromPlayerTime(chapter.end)}`
        }

        if (this.type === 'time') {
          parameters.t = fromPlayerTime(this.playtime)
        }

        return `<iframe width="${width}" height="${height}" src="${addQueryParameter(this.reference.share, parameters)}" frameborder="0" scrolling="no"></iframe>`
      }
    },
    methods: {
      fromPlayerTime,
      setEmbedSize: compose(store.dispatch.bind(store), store.actions.setShareEmbedSize),
      closeEmbedOverlay: compose(store.dispatch.bind(store), store.actions.hideShareEmbed)
    },
    components: {
      OverlayComponent,
      ButtonComponent,
      InputSelectComponent,
      InputTextComponent
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
