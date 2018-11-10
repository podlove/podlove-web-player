import { setStyles, addClasses, removeClasses } from 'utils/dom'

const marquee = el => {
  const scroller = el.firstChild

  const animationDuration = scroller.scrollWidth / 50

  setStyles({
    'white-space': 'nowrap',
    'overflow-x': 'hidden'
  })(scroller)

  setStyles({
    height: `${el.offsetHeight}px`
  })(el)

  setStyles({
    height: `${scroller.offsetHeight}px`,
    width: 'auto'
  })(scroller)

  setStyles({
    'overflow-x': 'visible'
  })(scroller)

  setTimeout(() => {
    if (scroller.scrollWidth > el.offsetWidth) {
      addClasses('marquee-container')(el)
      addClasses('marquee')(scroller)
      setStyles({
        'animation-duration': `${animationDuration > 10 ? animationDuration : 10}s`, // min 10s
        width: `${scroller.scrollWidth}px`
      })(scroller)
    } else {
      removeClasses('marquee-container')(el)
      removeClasses('marquee')(scroller)
    }
  }, 0)
}

export default {
  bind (el) {
    window.addEventListener('resize', () => marquee(el))
  },
  inserted: marquee,
  update: marquee
}
