const INITIAL = {
  open: false,
  embed: {
    size: '250x400',
    availableSizes: ['250x400', '320x400', '375x400', '600x290', '768x290'],
    start: false,
    starttime: 0
  },
  link: {
    start: false,
    starttime: 0
  }
}

const share = (state = INITIAL, action) => {
  switch (action.type) {
    case 'TOGGLE_SHARE':
      return {
        ...state,
        open: !state.open
      }
    case 'TOGGLE_SHARE_EMBED_START':
      return {
        ...state,
        embed: {
          ...state.embed,
          start: !state.embed.start
        }
      }
    case 'TOGGLE_SHARE_LINK_START':
      return {
        ...state,
        link: {
          ...state.link,
          start: !state.link.start
        }
      }
    case 'SET_SHARE_EMBED_SIZE':
      return {
        ...state,
        embed: {
          ...state.embed,
          size: action.payload
        }
      }
    case 'SET_SHARE_EMBED_STARTTIME':
      return {
        ...state,
        embed: {
          ...state.embed,
          starttime: action.payload
        }
      }
    case 'SET_SHARE_LINK_STARTTIME':
      return {
        ...state,
        link: {
          ...state.link,
          starttime: action.payload
        }
      }
    default:
      return state
  }
}

export {
  share
}
