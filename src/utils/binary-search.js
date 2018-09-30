export const binarySearch = (list = []) => search => {
  let minIndex = 0
  let maxIndex = list.length - 1
  let currentIndex
  let currentElement

  while (minIndex <= maxIndex) {
    currentIndex = (minIndex + maxIndex) / 2 | 0
    currentElement = list[currentIndex]

    if (currentElement < search) {
      minIndex = currentIndex + 1
    } else if (currentElement > search) {
      maxIndex = currentIndex - 1
    } else {
      return currentIndex
    }
  }

  return maxIndex
}
