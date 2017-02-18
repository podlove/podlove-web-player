<template>
  <li class="podlove-tabs--tab-header--item" :style="tabStyle(theme, active)" :class="{active}">
    <a href="javascript:void(0);" @click.prevent="click()" class="podlove-tabs--tab-header--caption">
      <span class="podlove-tabs--tab-header--icon" :style="{fill: iconColor(theme, active)}"><slot name="icon"></slot></span>
      <span class="podlove-tabs--tab-header--title"><slot name="title"></slot></span>
      <CloseIcon class="podlove-tabs--tab-header--close" :color="iconColor(theme, true)" v-if="active" />
    </a>
  </li>
</template>

<script>
  import color from 'color'
  import CloseIcon from 'icons/CloseIcon.vue'

  const tabStyle = (theme, active) => ({
    color: active ? theme.tabs.header.colorActive : color(theme.tabs.header.color).fade(0.2)
  })

  const iconColor = (theme, active) =>
    active ? theme.tabs.header.colorActive : color(theme.tabs.header.color).fade(0.2)


  export default {
    props: ['click', 'active'],
    data() {
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

  .podlove-tabs--tab-header--item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: ($padding / 2) $padding;
      width: 100%;
      margin: 0;
      height: $tabs-header-height;
      transition: all $animation-duration;

      &.active {
        background-color: $background-color;
      }
    }

    .podlove-tabs--tab-header--caption {
      display: flex;
      align-items: center;
      justify-content: center;

      overflow: hidden;
      vertical-align: middle;
      text-align: center;
      width: 100%;
    }


    .podlove-tabs--tab-header--icon {
      margin-right: $margin / 3;
    }

    .podlove-tabs--tab-header--close {
      display: none;
    }
</style>
