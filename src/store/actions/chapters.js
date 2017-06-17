const nextChapter = (playtime) => ({
  type: 'NEXT_CHAPTER'
})

const previousChapter = () => ({
  type: 'PREVIOUS_CHAPTER'
})

const setChapter = (chapterIndex) => ({
  type: 'SET_CHAPTER',
  payload: chapterIndex
})

export {
  setChapter,
  nextChapter,
  previousChapter
}
