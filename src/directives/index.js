import clipboard from './clipboard'
import marquee from './marquee'

export default VueInstance => {
  VueInstance.directive('clipboard', clipboard)
  VueInstance.directive('marquee', marquee)
  return VueInstance
}
