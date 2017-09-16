<template>
  <div class="share-link">
    <InputGroupComponent>
      <ButtonComponent slot="button" class="truncate" :data-clipboard-text="shareLink" v-clipboard>{{ $t('SHARE.ACTIONS.COPY') }}</ButtonComponent>
      <InputTextComponent slot="input" disabled="true" :value="shareLink"></InputTextComponent>
    </InputGroupComponent>
  </div>
</template>

<script>
  import ButtonComponent from 'shared/Button.vue'
  import InputGroupComponent from 'shared/InputGroup.vue'
  import InputTextComponent from 'shared/InputText.vue'

  import { addQueryParameter } from 'utils/url'
  import { secondsToTime } from 'utils/time'
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
          time = `${secondsToTime(chapter.start)},${secondsToTime(chapter.end)}`
        }

        if (this.type === 'time') {
          time = secondsToTime(this.playtime)
        }

        return addQueryParameter(this.episode.link, { t: time })
      }
    },
    components: {
      InputGroupComponent,
      ButtonComponent,
      InputTextComponent
    }
  }
</script>
