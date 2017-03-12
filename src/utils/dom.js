import curry from 'lodash/fp/curry'

export const findNode = selector => document.querySelectorAll(selector)
export const createNode = tag => document.createElement(tag)
export const appendNode = curry((node, child) => node.appendChild(child))

export const tag = curry((tag, value = '', attributes = {}) => {
  let attr = Object.keys(attributes).map(attribute => ` ${attribute}="${attributes[attribute]}"`)

  attr = attr.join('')
  return `<${tag}${attr}>${value}</${tag}>`
})
