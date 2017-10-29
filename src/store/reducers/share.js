const INITIAL = {
  content: 'episode',
  embed: {
    visible: false,
    available: ['250x400', '320x400', '375x400', '600x290', '768x290'],
    size: '320x400'
  }
}

const share = (state = INITIAL, action) => {
  switch (action.type) {
    case 'SET_SHARE_CONTENT':
      return {
        ...state,
        content: action.payload
      }
    case 'SET_SHARE_EMBED_SIZE':
      return {
        ...state,
        embed: {
          ...state.embed,
          size: action.payload
        }
      }
    case 'SHOW_SHARE_EMBED':
      return {
        ...state,
        embed: {
          ...state.embed,
          visible: true
        }
      }
    case 'HIDE_SHARE_EMBED':
      return {
        ...state,
        embed: {
          ...state.embed,
          visible: false
        }
      }
    default:
      return state
  }
}

export {
  share
}
