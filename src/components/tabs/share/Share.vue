<template>
  <div class="podlove-share">
    <div class="embed">
      <h4 class="embed--title">Embed</h4>
      <div class="embed--dialog">
        <input type="text" class="embed--input embed--copy" disabled :value="clipboardContent(reference, share, playtime)" />
        <button class="embed--copy-button" :data-clipboard-text="clipboardContent(reference, share, playtime)" v-clipboard v-on:click="openCopiedTooltip">copy</button>
      </div>
      <div class="embed--config">
        <div class="embed--config--time">
          <input type="checkbox" class="embed--checkbox" :value="share.customStart" v-on:change="toggleCustomStart()" />
          <label class="embed--label">Start um:</label>
          <input type="text" class="embed--input" :value="secondsToTime(share.customStarttime)" v-on:input="setCustomStarttime"/>
        </div>
        <div class="embed--config--size">
          <label class="embed--label">Playergröße:</label>
          <select class="embed--input" v-model="share.dimensions" v-on:change="setDimensions(share.dimensions)">
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

  const toggleCustomStart = () => {
    store.dispatch(store.actions.toggleShareCustomStart())
  }

  const openCopiedTooltip = (tooltipOpen) => {
    tooltipOpen = !tooltipOpen
    return tooltipOpen
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
        share: this.$select('share'),
        reference: this.$select('reference'),
        playtime: this.$select('playtime'),
        duration: this.$select('duration'),
        sizeOptions: ['250x400', '320x400', '375x400', '600x290', '768x290'],
        tooltipOpen: false
      }
    },
    methods: {
      setDimensions,
      clipboardContent,
      secondsToTime,
      toggleCustomStart,
      setCustomStarttime,
      openCopiedTooltip
    }
  }

</script>

<style lang="scss">
  @import 'variables';

  $embed-width: 40px;
  $embed-height: 35px;
  $size-button-width: 80px;

  .podlove-share {
    padding: $padding;

    .embed--title {
      color: $overlay-color;
      padding-bottom: 0;
      margin-bottom: $margin / 2;
    }

    .embed--input {
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

    .embed--copy {
      padding: $padding / 2;
      width: calc(100% - #{$embed-width});
      border-radius: 2px 0 0 2px;
      font-size: 1rem;
      height: $embed-height;
    }

    .embed--copy-button {
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

    .embed--dialog {
      display: flex;
      margin-bottom: $margin / 2;
    }

    .embed--config {
      display: flex;
      margin-bottom: $margin / 2;

      .embed--config--time {
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
        width: 50%;
      }

      .embed--config--size {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        width: 50%;
      }

      .embed--checkbox {
        display: inline-block;
        margin: ($margin / 2) ($margin / 2) 0 ($margin / 2);
      }

      .embed--label {
        display: inline-block;
        font-size: 0.8rem;
        margin-right: $margin / 3;
        padding: ($padding / 4) 0;
      }
    }
  }

</style>
