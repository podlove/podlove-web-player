<template>
  <li class="tab-header-item" :style="tabStyle(theme, active, display)" :class="{active}">
    <a href="javascript:void(0);" @click.prevent="click()" class="caption">
      <span class="icon" :style="{fill: iconColor(theme, active, display)}"><slot name="icon"></slot></span>
      <span class="title"><slot name="title"></slot></span>
      <CloseIcon class="close" :color="iconColor(theme, true, display)" v-if="active"></CloseIcon>
    </a>
  </li>
</template>

<script>
  import CloseIcon from 'icons/CloseIcon.vue'

  const tabStyle = (theme, active, display) => {
    const style = {
      color: theme.tabs.header.color,
      background: theme.tabs.header.background
    }

    if (active) {
      style.color = theme.tabs.header.colorActive
      style.background = theme.tabs.header.backgroundActive
    }

    if (display === 'embed') {
      style.color = theme.tabs.header.color
      style.background = theme.tabs.header.background
    }

    return style
  }

  const iconColor = (theme, active, display) => {
    let color = theme.tabs.header.color

    if (active) {
      color = theme.tabs.header.colorActive
    }

    if (display === 'embed') {
      color = theme.tabs.header.color
    }

    return color
  }

  export default {
    props: ['click', 'active'],
    data () {
      return {
        theme: this.$select('theme'),
        display: this.$select('display')
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
