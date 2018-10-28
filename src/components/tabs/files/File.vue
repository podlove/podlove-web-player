<template>
  <div class="files-container--file">
    <files-audio-icon width="32" height="32" class="files-container--icon" aria-hidden="true"/>
    <div class="files-container--meta">
      <div class="files-container--type truncate">{{ file.title }}</div>
      <div class="files-container--info">
        <span class="files-container--size" v-if="file.size">{{ toMegabyte(file.size) }} MB</span>
        <span v-if="file.size">⋅</span>
        <span class="files-container--fileending" v-if="file.mimeType ">{{ file.mimeType }}</span>
      </div>
    </div>
    <div class="files-container--actions">
      <copy-tooltip-component slot="button" :content="file.url">
        <button-component class="action" type="light">
          <link-icon aria-hidden="true"/>
          <span class="visually-hidden">{{ $t('A11Y.COPY_FILE', file) }}</span>
        </button-component>
      </copy-tooltip-component>
      <button-component class="action download-button" :href="file.url" type="link" download>
        <span aria-hidden="true">{{ $t('FILES.ACTIONS.DOWNLOAD') }}</span>
        <span class="visually-hidden">{{ $t('A11Y.DOWNLOAD_FILE', file) }}</span>
      </button-component>
    </div>
  </div>
</template>

<script>
  import ButtonComponent from 'shared/Button'
  import CopyTooltipComponent from 'shared/CopyTooltip'

  import IconContainer from 'icons/icon-container'
  import FilesAudioIcon from 'icons/FilesAudioIcon'
  import LinkIcon from 'icons/LinkIcon'

  export default {
    props: ['file'],

    methods: {
      toMegabyte (size) {
        return parseInt(parseInt(size) / 1000000)
      }
    },

    components: {
      ButtonComponent,
      CopyTooltipComponent,
      FilesAudioIcon: IconContainer(FilesAudioIcon),
      LinkIcon
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .files-container--file {
    display: flex;
    margin-bottom: 1em;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .files-container--icon {
    display: block;
    margin-right: 1em;
    width: $files-icon-width;
    height: $files-icon-width;
  }

  .files-container--info {
    opacity: 0.8;
  }

  .files-container--type {
    font-weight: 500;
  }

  .files-container--meta {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: calc(100% - #{$files-icon-width} - #{$files-actions-width});
    line-height: 1.2em;
  }

  .files-container--actions {
    display: flex;
    justify-content: flex-end;
    width: $files-actions-width;

    .input-button {
      margin-left: 1em;
    }
  }

    @media screen and (max-width: $width-m) {
      .files-container--icon, .download-button {
        display: none;
      }

      .files-container--meta {
        width: calc(100% - #{$files-icon-width});
      }

        .files-container--actions {
          width: $files-icon-width;
        }
    }
</style>
