
// Transforms a h:mm:ss or mm:ss or ss time to seconds
export function timeToSeconds (time = '0') {
  const partials = time.split(':').reverse()

  return partials.reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0)
}

const calcSeconds = (time = 0) => parseInt(time % 60)
const calcMinutes = (time = 0) => parseInt(time / 60) % 60
const calcHours = (time = 0) => parseInt(time / 3600) % 24
const leadingZero = (time) => time > 9 ? `${time}` : `0${time}`

// Transforms seconds to (hh:)mm:ss
export function secondsToTime (time = 0) {
  let hours = calcHours(time)
  let minutes = calcMinutes(time)
  let seconds = calcSeconds(time)

  let result = `${leadingZero(minutes)}:${leadingZero(seconds)}`

  if (hours > 0) {
    result = `${leadingZero(hours)}:${result}`
  }

  return result
}
