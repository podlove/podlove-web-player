<template>
  <PodloveOverlay :visible="share.open" :on-close="toggleShare">
      <h3 class="podlove-player--overlay--title" slot="header">Share</h3>
      <div class="podlove-player--embed">
        <h4 class="podlove-player--embed--title">Embed</h4>
        <div class="podlove-player--embed--dialog">
          <input type="text" class="podlove-player--embed--input" disabled :value="clipboardContent(reference, share)" />
          <button class="podlove-player--embed--copy-button" :data-clipboard-text="clipboardContent(reference, share)" v-clipboard>copy</button>
        </div>
        <div class="podlove-player--embed--config">
          <div class="podlove-player--embed--config--time">
          </div>
          <div class="podlove-player--embed--config--size">
            <button class="podlove-player--embed--size-button" @click="setDimensions(250, 440)" :class="{active: activeSizeButton(share, 250, 440)}">xs</button>
            <button class="podlove-player--embed--size-button" @click="setDimensions(320, 440)" :class="{active: activeSizeButton(share, 320, 440)}">s</button>
            <button class="podlove-player--embed--size-button" @click="setDimensions(375, 440)" :class="{active: activeSizeButton(share, 375, 440)}">m</button>
            <button class="podlove-player--embed--size-button" @click="setDimensions(600, 320)" :class="{active: activeSizeButton(share, 600, 320)}">l</button>
            <button class="podlove-player--embed--size-button" @click="setDimensions(768, 320)" :class="{active: activeSizeButton(share, 768, 320)}">xl</button>
          </div>
        </div>
      </div>
  </PodloveOverlay>
</template>

<script>
  import store from 'store'
  import PodloveOverlay from 'shared/Overlay.vue'
  import CopyIcon from 'icons/CopyIcon.vue'

  const toggleShare = () => {
    store.dispatch(store.actions.toggleShare())
  }

  const clipboardContent = (reference, share) =>
    `<iframe width="${share.width}" height="${share.height}" src="${reference.share}?episode=${reference.config}" frameborder="0" scrolling="no"></iframe>`

  const setDimensions = (width, height) => {
    store.dispatch(store.actions.setEmbedDimensions(width, height))
  }

  const activeSizeButton = (share, width, height) => {
    return share.width === width && share.height === height
  }

  export default {
    data() {
      return {
        theme: this.$select('theme'),
        share: this.$select('share'),
        reference: this.$select('reference')
      }
    },
    components: {
      PodloveOverlay,
      CopyIcon
    },
    methods: {
      toggleShare,
      setDimensions,
      activeSizeButton,
      clipboardContent
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  $embed-width: 40px;
  $embed-height: 35px;
  $size-button-width: 30px;

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
    display: block;
    width: calc(100% - #{$embed-width});
    resize: none;
    padding: $padding / 2;
    font-size: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid $overlay-color;
    height: $embed-height;
    border-radius: 2px 0 0 2px;
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

  .podlove-player--embed--size-button {
    display: inline-block;
    cursor: pointer;
    opacity: 1;
    color: $background-color;
    border: 2px solid  $overlay-color;
    background-color: $overlay-color;
    width: $size-button-width;
    margin: 0 $margin / 3;
    border-radius: $size-button-width / 5;

    &.active {
      color: $overlay-color;
      background: $background-color;
    }
  }
</style>
