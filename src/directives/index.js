import clipboard from './clipboard'
import marquee from './marquee'
import VIscroll from 'viscroll'

export default VueInstance => {
  VueInstance.directive('clipboard', clipboard)
  VueInstance.directive('marquee', marquee)
  VueInstance.use(VIscroll, {
    mouseWheel: true,
    scrollbars: false
  })
  return VueInstance
}
