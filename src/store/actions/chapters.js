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

const updateChapter = (playtime) => ({
  type: 'UPDATE_CHAPTER',
  payload: playtime
})

export {
  setChapter,
  nextChapter,
  previousChapter,
  updateChapter
}
