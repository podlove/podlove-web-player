import Vue from 'vue'
import { mapState } from 'redux-vuex'

export default iconComponent => Vue.component('icon', {
  props: ['width', 'height'],

  render: function (h) {
    return h(iconComponent, {
      props: {
        color: this.theme.icon.color,
        background: this.theme.icon.background,
        width: this.width,
        height: this.height
      }
    })
  },

  data: mapState('theme')
})
