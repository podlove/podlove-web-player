import { setStyles, hasOverflow, addClasses, removeClasses } from 'utils/dom'

const marquee = el => {
  const scroller = el.firstChild

  setStyles({
    'overflow-x': 'auto',
    'white-space': 'nowrap'
  })(scroller)

  setStyles({
    height: `${el.offsetHeight}px`
  })(el)

  setStyles({
    height: `${scroller.offsetHeight}px`
  })(scroller)

  if (hasOverflow(scroller)) {
    addClasses('marquee-container')(el)
    addClasses('marquee')(scroller)
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
