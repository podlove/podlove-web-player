import { setStyles, addClasses, removeClasses } from 'utils/dom'

const marquee = el => {
  const scroller = el.firstChild

  const animationDuration = scroller.scrollWidth / 50

  setStyles({
    'overflow-x': 'auto',
    'white-space': 'nowrap'
  })(scroller)

  setStyles({
    height: `${el.offsetHeight}px`
  })(el)

  setStyles({
    height: `${scroller.offsetHeight}px`,
    width: `${scroller.scrollWidth}px`
  })(scroller)

  if (scroller.scrollWidth > el.offsetWidth) {
    addClasses('marquee-container')(el)
    addClasses('marquee')(scroller)
    setStyles({
      'animation-duration': `${animationDuration > 10 ? animationDuration : 10}s` // min 10s
    })(scroller)
  } else {
    removeClasses('marquee-container')(el)
    removeClasses('marquee')(scroller)
  }

  setStyles({
    'overflow-x': 'visible'
  })(scroller)
}

export default {
  bind (el) {
    window.addEventListener('resize', () => marquee(el))
  },
  inserted: marquee,
  update: marquee
}
