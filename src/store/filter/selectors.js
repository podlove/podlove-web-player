import { get } from 'lodash/fp'

export const selectActiveChannels = get('channels')
export const selectBuffer = get('buffer')
