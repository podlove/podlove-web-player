<template>
  <div class="share-link">
    <input-group-component>
      <copy-tooltip-component slot="button" :content="shareLink">
        <button-component class="truncate">{{ $t('SHARE.ACTIONS.COPY') }}</button-component>
      </copy-tooltip-component>
      <input-text-component slot="input" disabled="true" :value="shareLink"></input-text-component>
    </input-group-component>
  </div>
</template>

<script>
  import Vue from 'vue'

  import ButtonComponent from 'shared/Button'
  import InputGroupComponent from 'shared/InputGroup'
  import InputTextComponent from 'shared/InputText'
  import CopyTooltipComponent from 'shared/CopyTooltip'

  import { addQueryParameter } from 'utils/url'
  import { fromPlayerTime } from 'utils/time'
  import { currentChapter } from 'utils/chapters'

  export default {
    props: ['type'],
    data () {
      return {
        share: this.$select('share'),
        episode: this.$select('episode'),
        show: this.$select('show'),
        playtime: this.$select('playtime'),
        chapters: this.$select('chapters')
      }
    },
    computed: {
      shareLink () {
        let time

        if (this.type === 'show') {
          return this.show.link
        }

        if (this.type === 'episode') {
          return this.episode.link
        }

        if (this.type === 'chapter') {
          const chapter = currentChapter(this.chapters)
          time = `${fromPlayerTime(chapter.start)},${fromPlayerTime(chapter.end)}`
        }

        if (this.type === 'time') {
          time = fromPlayerTime(this.playtime)
        }

        return addQueryParameter(this.episode.link, { t: time })
      }
    },
    components: {
      InputGroupComponent,
      ButtonComponent,
      InputTextComponent,
      CopyTooltipComponent
    }
  }
</script>
