<template>
  <li class="tab-header-item" :style="tabStyle(theme, active)" :class="{active}">
    <a href="javascript:void(0);" @click.prevent="click()" class="caption">
      <span class="icon" :style="{fill: iconColor(theme, active)}"><slot name="icon"></slot></span>
      <span class="title"><slot name="title"></slot></span>
      <CloseIcon class="close" :color="iconColor(theme, true)" v-if="active" />
    </a>
  </li>
</template>

<script>
  import CloseIcon from 'icons/CloseIcon.vue'

  const tabStyle = (theme, active) => ({
    color: active ? theme.tabs.header.colorActive : theme.tabs.header.color,
    background: active ? theme.tabs.header.backgroundActive : theme.tabs.header.background
  })

  const iconColor = (theme, active) =>
    active ? theme.tabs.header.colorActive : theme.tabs.header.color

  export default {
    props: ['click', 'active'],
    data () {
      return {
        theme: this.$select('theme')
      }
    },
    components: {
      CloseIcon
    },
    methods: {
      tabStyle,
      iconColor
    }
  }
</script>

<style lang="scss">
  @import 'variables';

  .tab-header-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: ($padding / 2) $padding;
      width: 100%;
      margin: 0;
      height: $tabs-header-height;
      transition: all $animation-duration;

    .caption {
      display: flex;
      align-items: center;
      justify-content: center;

      overflow: hidden;
      vertical-align: middle;
      text-align: center;
      width: 100%;
    }

    .title {
      margin-left: $margin / 3;
    }

    .icon {
      margin-right: $margin / 3;
      line-height: 0;
    }

    .close {
      display: none;
    }

    @media screen and (max-width: $width-s) {
      .title {
        display: none;
      }
    }
  }
</style>
