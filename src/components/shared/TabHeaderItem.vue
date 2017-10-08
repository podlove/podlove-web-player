<template>
  <li class="tab-header-item" :style="tabStyle" :class="{active}">
    <a href="javascript:void(0);" @click.prevent="click()" class="caption">
      <span class="icon" :style="{fill: iconColor(active)}"><slot name="icon"></slot></span>
      <span class="title"><slot name="title"></slot></span>
      <CloseIcon class="close" :color="iconColor(true)" v-if="active"></CloseIcon>
    </a>
  </li>
</template>

<script>
  import CloseIcon from 'icons/CloseIcon.vue'

  export default {
    props: ['click', 'active'],
    data () {
      return {
        theme: this.$select('theme'),
        display: this.$select('display')
      }
    },
    computed: {
      tabStyle () {
        const style = {
          color: this.theme.tabs.header.color,
          background: this.theme.tabs.header.background
        }

        if (this.active) {
          style.color = this.theme.tabs.header.colorActive
          style.background = this.theme.tabs.header.backgroundActive
        }

        if (this.display === 'embed') {
          style.color = this.theme.tabs.header.color
          style.background = this.theme.tabs.header.background
        }

        return style
      }
    },
    methods: {
      iconColor (active) {
        let color = this.theme.tabs.header.color

        if (active) {
          color = this.theme.tabs.header.colorActive
        }

        if (this.display === 'embed') {
          color = this.theme.tabs.header.color
        }

        return color
      }
    },
    components: {
      CloseIcon
    }
  }
</script>

<style lang="scss">
  @import '~styles/variables';

  .tab-header-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin: 0;
    height: $tabs-header-height;
    transition: all $animation-duration;

    .caption {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 ($padding / 2);

      overflow: hidden;
      vertical-align: middle;
      text-align: center;
      width: 100%;
      height: 100%;
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

    @media screen and (max-width: $width-m) {
      .title {
        display: none;
      }
    }
  }
</style>
