import test from 'ava'
import { episode } from './episode'

let testAction

test.beforeEach(t => {
  testAction = {
    type: 'INIT',
    payload: {
      title: 'title',
      subtitle: 'subtitle',
      poster: '//episode/poster',
      summary: 'Die muntere Talk Show um Leben mit Technik, das Netz und Technikkultur. Bisweilen Apple-lastig aber selten einseitig. Wir leben und lieben Technologie und reden darüber. Mit Tim, hukl, roddi, Clemens und Denis. Freak Show hieß irgendwann mal mobileMacs.',
      link: 'https://freakshow.fm/fs171-invasion',
      publicationDate: '2016-02-11T03:13:55+00:00'
    }
  }
})

test(`episode: it is a reducer function`, t => {
  t.is(typeof episode, 'function')
})

test(`episode: it extracts the episode meta information`, t => {
  const result = episode({}, testAction)

  testAction.payload.publicationDate = new Date('2016-02-11T03:13:55+00:00').getTime()

  t.deepEqual(result, testAction.payload)
})

test(`episode: it falls back to default state`, t => {
  const result = episode(undefined, { type: 'INIT' })
  t.deepEqual(result, {
    title: null,
    subtitle: null,
    poster: null,
    summary: null,
    link: null,
    publicationDate: null
  })
})

test(`episode: it does nothing if not the init action is dispatched`, t => {
  const result = episode('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})
