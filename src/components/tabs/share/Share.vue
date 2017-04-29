<template>
  <div class="podlove-share">
    <div class="embed">
      <h4 class="title">Embed</h4>
      <div class="input-row">
        <input type="text" class="share-input share-copy" disabled :value="clipboardContent(reference, share, playtime)" />
        <PodloveButton
          class="share-copy-button"
          :data-clipboard-text="clipboardContent(reference, share, playtime)"
          v-clipboard
          :style="buttonStyle(theme)">
            copy
        </PodloveButton>
      </div>
      <div class="input-row">
        <div class="share-config--time">
          <label class="input-label"><input type="checkbox" class="embed--checkbox" :value="share.customStart" v-on:change="toggleCustomStart(playtime)" /> Start:</label>
          <input type="text" class="share-input" :value="secondsToTime(share.customStarttime)" v-on:input="setCustomStarttime"/>
        </div>
        <div class="share-config--size">
          <label class="input-label">Size:</label>
          <select class="share-input" v-model="share.dimensions" v-on:change="setDimensions(share.dimensions)">
            <option v-for="option in sizeOptions" v-bind:value="option">
              {{ option }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {debounce, get} from 'lodash'
  import PodloveButton from 'shared/Button.vue'

  import store from 'store'
  import {secondsToTime, timeToSeconds} from 'utils/time'

  const clipboardContent = (reference, share, playtime) => {
    const [width, height] = share.dimensions.split('x')
    let time = share.customStart ? `&playtime=${secondsToTime(share.customStarttime)}` : ''

    return `<iframe width="${width}" height="${height}" src="${reference.share}?episode=${reference.config}${time}" frameborder="0" scrolling="no"></iframe>`
  }

  // Sharing
  const setDimensions = dimensions => {
    store.dispatch(store.actions.setEmbedDimensions(dimensions))
  }

  const toggleCustomStart = (time) => {
    store.dispatch(store.actions.toggleShareCustomStart())
    store.dispatch(store.actions.setCustomStarttime(time))
  }

  const setCustomStarttime = debounce(input => {
    const duration = get(store.store.getState(), 'duration')
    let time = timeToSeconds(input.target.value)

    if (!time) {
      return
    }

    if (time > duration) {
      time = duration
    }

    store.dispatch(store.actions.setCustomStarttime(time))
  }, 1000)

  const buttonStyle = (theme) => ({
    color: theme.tabs.button.text,
    background: theme.tabs.button.background
  })

  export default {
    data() {
      return {
        share: this.$select('share'),
        reference: this.$select('reference'),
        playtime: this.$select('playtime'),
        duration: this.$select('duration'),
        sizeOptions: ['250x400', '320x400', '375x400', '600x290', '768x290'],
        theme: this.$select('theme')
      }
    },
    methods: {
      setDimensions,
      clipboardContent,
      secondsToTime,
      toggleCustomStart,
      setCustomStarttime,
      buttonStyle
    },
    components: {
      PodloveButton
    }
  }

</script>

<style lang="scss">
  @import 'variables';
  @import 'utils';
  @import 'inputs';

  $embed-width: 40px;
  $embed-height: 35px;
  $size-button-width: 80px;

  .podlove-share {
    padding: $padding;

    .share-input {
      display: inline-block;
      resize: none;
      padding: $padding / 4;
      border-color: rgba($accent-color, 0.8);
      border-width: 1px;
      border-radius: 2px;
    }

    .share-copy {
      padding: $padding / 2;
      width: calc(100% - #{$embed-width});
      border-radius: 2px 0 0 2px;
      font-size: 1em;
      border-width: 1px 0 1px 1px;
      height: $embed-height;
    }

    .share-copy-button {
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;

      height: $embed-height;
      width: $embed-width;
      border: 1px solid rgba($accent-color, 0.8);

      opacity: 1;

      &:hover {
        opacity: 0.8;
      }
    }

    .share-config--time, .share-config--size {
      line-height: 1em;
    }

    .input-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: $margin / 2;
    }

    .input-label {
      margin-bottom: $margin / 4;
    }

    @media screen and (max-width: $width-m) {
      .share-config--time, .share-config--size {
        .input-label {
          display: block;
        }
      }
    }
  }

</style>
