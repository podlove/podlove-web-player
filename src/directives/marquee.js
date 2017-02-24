const addClass = (el, cssClass) => {
  let classNames = el.className.split(' ')

  if (~classNames.indexOf(cssClass)) {
    return classNames.join(' ')
  }

  return [...classNames, cssClass].join(' ')
}

const removeClass = (el, cssClass) => {
  let classNames = el.className.split(' ')
  let index = classNames.indexOf(cssClass)

  if (!~index) {
    return classNames.join(' ')
  }
  classNames.splice(index, 1)
  return classNames.join(' ')
}

export default {
  update (el, binding, vnode) {
    if (el.parentNode.clientWidth >= el.clientWidth) {
      el.className = removeClass(el, 'marquee')
      return
    }

    if (el.innerText === el.marquee_text) {
      return
    }

    el.marquee_text = el.innerText
    el.className = addClass(el, 'marquee')
  }
}
