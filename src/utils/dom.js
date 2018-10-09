import { curry, compose, uniq, concat, join, filter, head, identity } from 'lodash/fp'
import DOMPurify from 'dompurify'

export const findNode = selector => typeof selector === 'string' ? head(document.querySelectorAll(selector)) : selector
export const createNode = tag => document.createElement(tag)
export const appendNode = curry((node, child) => {
  node.appendChild(child)

  return child
})

export const tag = curry((tag, value = '', attributes = {}) => {
  let attr = Object.keys(attributes).map(attribute => ` ${attribute}="${attributes[attribute]}"`)

  attr = attr.join('')
  return `<${tag}${attr}>${value}</${tag}>`
})

export const setStyles = (attrs = {}) => el => {
  Object.keys(attrs).forEach(property => {
    el.style[property] = attrs[property]
  })

  return el
}

export const getClasses = compose(filter(identity), el => el.className.split(' '))

export const hasOverflow = el => el.scrollWidth > el.clientWidth

export const addClasses = (classes = []) => el => {
  el.className = compose(join(' '), uniq, concat(classes), getClasses)(el)

  return el
}

export const removeClasses = (classes = []) => el => {
  el.className = compose(join(' '), filter(className => !~classes.indexOf(className)), getClasses)(el)

  return el
}

export const sanitize = input => {
  if (!input || typeof window === 'undefined') {
    return input
  }

  const purify = DOMPurify(window)

  // Adds target="_blank" to parsed links
  purify.addHook('afterSanitizeElements', node => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
    }

    return node
  })

  return purify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'li', 'ol', 'br'],
    ALLOWED_ATTR: ['href', 'target']
  })
}

export const setAttributes = (attrs = {}) => el => {
  Object.keys(attrs).forEach(property => {
    el.setAttribute(property, attrs[property])
  })

  return el
}

export const cleanDom = curry((keep = '', node) => {
  [...node.children].forEach(child => {
    if (child.tagName === keep.toUpperCase()) {
      return
    }

    node.removeChild(child)
  })
})
