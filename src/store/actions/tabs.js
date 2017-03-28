const toggleTab = tab => ({
  type: 'TOGGLE_TAB',
  payload: tab
})

const setTabs = tabs => ({
  type: 'SET_TABS',
  payload: tabs
})

export {
  toggleTab,
  setTabs
}
