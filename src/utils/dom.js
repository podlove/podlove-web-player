import { curry, compose, uniq, concat, join, filter } from 'lodash/fp'

export const findNode = selector => document.querySelectorAll(selector)
export const createNode = tag => document.createElement(tag)
export const appendNode = curry((node, child) => node.appendChild(child))

export const tag = curry((tag, value = '', attributes = {}) => {
  let attr = Object.keys(attributes).map(attribute => ` ${attribute}="${attributes[attribute]}"`)

  attr = attr.join('')
  return `<${tag}${attr}>${value}</${tag}>`
})

export const setStyles = (attrs = {}) => el => {
  Object.keys(attrs).forEach(property => {
    el.style[property] = attrs[property]
  })
}

export const getClasses = el => el.className.split(' ')

export const hasOverflow = el => el.scrollWidth > el.clientWidth

export const addClasses = (...classes) => el => {
  el.className = compose(join(' '), uniq, concat(classes), getClasses)(el)

  return el
}

export const removeClasses = (...classes) => el => {
  el.className = compose(join(' '), filter(className => !~classes.indexOf(className)), getClasses)(el)

  return el
}
