<template>
  <div class="share-link" id="tab-share--share-link">
    <input-group-component>
      <copy-tooltip-component slot="button" :content="shareLink">
        <button-component class="truncate">
          <span aria-hidden="true">{{ $t('SHARE.ACTIONS.COPY') }}</span>
          <span class="visually-hidden">{{ $t('A11Y.COPY_SHARE_LINK') }}</span>
        </button-component>
      </copy-tooltip-component>
      <input-text-component slot="input" disabled="true" :value="shareLink" id="tab-share--share-link--input"></input-text-component>
    </input-group-component>
  </div>
</template>

<script>
  import { mapState } from 'redux-vuex'

  import ButtonComponent from 'shared/Button'
  import InputGroupComponent from 'shared/InputGroup'
  import InputTextComponent from 'shared/InputText'
  import CopyTooltipComponent from 'shared/CopyTooltip'

  import { addQueryParameter } from 'utils/url'
  import { fromPlayerTime } from 'utils/time'
  import { currentChapter } from 'utils/chapters'

  export default {
    props: ['type'],
    data: mapState('share', 'episode', 'show', 'playtime', 'chapters'),
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
