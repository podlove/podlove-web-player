import { isUndefined, isNull } from 'lodash/fp'

const or = (p1, p2) => x => p1(x) || p2(x)
// const and = (p1, p2) => x => p1(x) && p2(x)
const not = p => x => !p(x)

export const isUndefinedOrNull = or(isUndefined, isNull)
export const isDefinedAndNotNull = not(isUndefinedOrNull)
