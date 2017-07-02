import test from 'ava'
import { show } from './show'

let testAction

test.beforeEach(t => {
  testAction = {
    type: 'INIT',
    payload: {
      show: {
        title: 'showTitle',
        subtitle: 'Menschen! Technik! Sensationen!',
        summary: 'Die muntere Talk Show um Leben mit Technik, das Netz und Technikkultur. Bisweilen Apple-lastig aber selten einseitig. Wir leben und lieben Technologie und reden darüber. Mit Tim, hukl, roddi, Clemens und Denis. Freak Show hieß irgendwann mal mobileMacs.',
        poster: '//show/poster',
        link: 'https://freakshow.fm'
      }
    }
  }
})

test(`show: it is a reducer function`, t => {
  t.is(typeof show, 'function')
})

test(`show: it extracts the show`, t => {
  const result = show('', testAction)
  t.deepEqual(result, testAction.payload.show)
})

test(`show: it returns null if no show is available`, t => {
  const result = show({}, {
    type: 'INIT'
  })

  t.deepEqual(result, {
    title: null,
    subtitle: null,
    summary: null,
    poster: null,
    link: null
  })
})

test(`show: it does nothing if not the init action is dispatched`, t => {
  const result = show('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })

  t.is(result, 'foobar')
})

test(`show: it has a default fallback if a missing state is provided`, t => {
  const result = show(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })

  t.deepEqual(result, {
    title: null,
    subtitle: null,
    summary: null,
    poster: null,
    link: null
  })
})
