import compose from 'lodash/fp/compose'

const enforceNumber = input => isNaN(parseInt(input)) ? 0 : input

// Transforms a h:mm:ss or mm:ss or ss time to seconds
export function timeToSeconds (time) {
  time = time || '0'
  const partials = time.toString().split(':').reverse()

  return partials.reduce((prev, curr, i) =>
    enforceNumber(prev) + enforceNumber(curr) * Math.pow(60, i), 0)
}

export const calcSeconds = (time = 0) => parseInt(time % 60)
export const calcMinutes = (time = 0) => parseInt(time / 60) % 60
export const calcHours = (time = 0) => parseInt(time / 3600) % 24

export const localeDate = (timestamp, locale) => new Date(timestamp).toLocaleDateString(locale)
export const localeTime = (timestamp, locale) => new Date(timestamp).toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'})

const leadingZero = (time) => time > 9 ? `${time}` : `0${time}`

// Transforms seconds to (hh:)mm:ss
export function secondsToTime (time = 0) {
  time = time < 0 ? 0 : time

  let hours = compose(calcHours, enforceNumber)(time)
  let minutes = compose(calcMinutes, enforceNumber)(time)
  let seconds = compose(calcSeconds, enforceNumber)(time)

  let result = `${leadingZero(minutes)}:${leadingZero(seconds)}`

  if (hours > 0) {
    result = `${hours}:${result}`
  }

  return result
}
