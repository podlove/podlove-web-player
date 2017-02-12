<template>
  <PodloveOverlay :visible="share.open" :on-close="toggleShare">
      <h3 class="podlove-player--overlay--title" slot="header">Share</h3>
      <div class="podlove-player--embed">
        <h4 class="podlove-player--embed--title">Embed</h4>
        <div class="podlove-player--embed--dialog">
          <input type="text" class="podlove-player--embed--input podlove-player--embed--copy" disabled :value="clipboardContent(reference, share, playtime)" />
          <button class="podlove-player--embed--copy-button" :data-clipboard-text="clipboardContent(reference, share, playtime)" v-clipboard>copy</button>
        </div>
        <div class="podlove-player--embed--config">
          <div class="podlove-player--embed--config--time">
            <input type="checkbox" class="podlove-player--embed--checkbox" v-model="share.customStart" v-on:change="toggleCustomStart()" />
            <label class="podlove-player--embed--label">Start um:</label>
            <input type="text" class="podlove-player--embed--input" :value="secondsToTime(share.customStarttime)" v-on:input="setCustomStarttime"/>
          </div>
          <div class="podlove-player--embed--config--size">
            <label class="podlove-player--embed--label">Playergröße:</label>
            <select class="podlove-player--embed--input" v-model="share.dimensions" v-on:change="setDimensions(share.dimensions)">
              <option v-for="option in sizeOptions" v-bind:value="option">
                {{ option }}
              </option>
            </select>
          </div>
        </div>
      </div>
  </PodloveOverlay>
</template>

<script>
  import get from 'lodash/get'
  import debounce from 'lodash/debounce'

  import store from 'store'
  import {secondsToTime, timeToSeconds} from 'utils/time'

  import PodloveOverlay from 'shared/Overlay.vue'
  import CopyIcon from 'icons/CopyIcon.vue'

  const toggleShare = () => {
    store.dispatch(store.actions.toggleShare())
  }

  const clipboardContent = (reference, share, playtime) => {
    const [width, height] = share.dimensions.split('x')
    let time = share.customStart ? `&playtime=${secondsToTime(share.customStarttime)}` : ''

    return `<iframe width="${width}" height="${height}" src="${reference.share}?episode=${reference.config}${time}" frameborder="0" scrolling="no"></iframe>`
  }

  // Sharing

  const setDimensions = dimensions => {
    store.dispatch(store.actions.setEmbedDimensions(dimensions))
  }

  const toggleCustomStart = () => {
    store.dispatch(store.actions.toggleShareCustomStart())
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

  export default {
    data() {
      return {
        theme: this.$select('theme'),
        share: this.$select('share'),
        reference: this.$select('reference'),
        playtime: this.$select('playtime'),
        duration: this.$select('duration'),
        sizeOptions: ['250x440', '320x440', '375x440', '600x320', '768x320']
      }
    },
    components: {
      PodloveOverlay,
      CopyIcon
    },
    methods: {
      toggleShare,
      setDimensions,
      clipboardContent,
      secondsToTime,
      toggleCustomStart,
      setCustomStarttime
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  $embed-width: 40px;
  $embed-height: 35px;
  $size-button-width: 80px;

  .podlove-player--embed--title {
    color: $overlay-color;
    padding-bottom: 0;
    margin-bottom: $margin / 2;
  }

  .podlove-player--embed--dialog {
    display: flex;
    margin-bottom: $margin / 2;
  }

  .podlove-player--embed--input {
    display: inline-block;
    resize: none;
    padding: $padding / 4;
    font-size: 0.8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid $overlay-color;
    border-radius: 2px;
    height: 100%;
  }

  .podlove-player--embed--copy {
    padding: $padding / 2;
    width: calc(100% - #{$embed-width});
    border-radius: 2px 0 0 2px;
    font-size: 1rem;
    height: $embed-height;
  }

  .podlove-player--embed--copy-button {
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    height: $embed-height;
    width: $embed-width;
    background: $overlay-color;
    color: $background-color;
    border-color: $overlay-color;
    border-width: 1px 1px 1px 0;
    border-radius: 0 2px 2px 0;

    opacity: 1;

    &:hover {
      opacity: 0.8;
    }
  }

  .podlove-player--embed--config {
    display: flex;
    margin-bottom: $margin / 2;
  }

  .podlove-player--embed--config--time {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    width: 50%;
  }

  .podlove-player--embed--config--size {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    width: 50%;
  }

  .podlove-player--embed--label {
    display: inline-block;
    font-size: 0.8rem;
    margin-right: $margin / 3;
    padding: ($padding / 4) 0;
  }

  .podlove-player--embed--checkbox {
    display: inline-block;
    margin: ($margin / 2) ($margin / 2) 0 ($margin / 2);
  }
</style>
