/**
 * Collection of functional helpers
 */

export const inAnimationFrame = func => (...args) => window.requestAnimationFrame(() => func.apply(null, args))

export const callWith = (...args) => func => func.apply(null, args)
