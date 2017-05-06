import test from 'ava'
import { poster, subtitle, title, reference, mode, showTitle } from './init'

let testAction

test.beforeEach(t => {
  testAction = {
    type: 'INIT',
    payload: {
      title: 'title',
      subtitle: 'subtitle',
      publicationDate: '2016-02-11T03:13:55+00:00',
      poster: '//episode/poster',
      show: {
        title: 'showTitle',
        subtitle: 'Menschen! Technik! Sensationen!',
        summary: 'Die muntere Talk Show um Leben mit Technik, das Netz und Technikkultur. Bisweilen Apple-lastig aber selten einseitig. Wir leben und lieben Technologie und reden darüber. Mit Tim, hukl, roddi, Clemens und Denis. Freak Show hieß irgendwann mal mobileMacs.',
        poster: '//show/poster',
        url: 'https://freakshow.fm'
      },
      duration: '04:15:32',
      chapters: [
        { start: '00:00:00', title: 'Intro' },
        { start: '00:01:39', title: 'Begrüßung' },
        { start: '00:04:58', title: 'IETF Meeting Netzwerk' },
        { start: '00:18:37', title: 'Kalender' },
        { start: '00:33:40', title: 'Freak Show Bingo' },
        { start: '00:35:37', title: 'Wikipedia' },
        { start: '01:17:26', title: 'iPhone Akkukalibration' },
        { start: '01:24:55', title: 'Alte iPads und iPod touches' },
        { start: '01:31:02', title: 'Find My Friends' },
        { start: '01:41:46', title: 'iPhone Music Player' },
        { start: '01:56:13', title: 'Apple Watch' },
        { start: '02:11:51', title: 'Kommandozeile: System Appreciation' },
        { start: '02:23:10', title: 'Sound und Design für Games' },
        { start: '02:24:59', title: 'Kommandozeile: Remote Deployment' },
        { start: '02:32:37', title: 'Kommandozeile: Man Pages' },
        { start: '02:44:31', title: 'Kommandozeile: screen vs. tmux' },
        { start: '02:58:02', title: 'Star Wars: Machete Order & Phantom Edit' },
        { start: '03:20:05', title: 'Kopfhörer-Ersatzteile' },
        { start: '03:23:39', title: 'Dante' },
        { start: '03:38:03', title: 'Dante Via' },
        { start: '03:45:33', title: 'Internet of Things Security' },
        { start: '03:56:11', title: 'That One Privacy Guy\'s VPN Comparison Chart' },
        { start: '04:10:00', title: 'Ausklang' }
      ],
      audio: [
        'my/audio/url.mp4'
      ],
      reference: {
        config: '//config/reference',
        share: '//share/reference',
        origin: '//origin/reference'
      },
      runtime: 'runtime'
    }
  }
})

// POSTER TESTS
test(`poster: it is a reducer function`, t => {
  t.is(typeof poster, 'function')
})

test(`poster: it extracts the episode poster`, t => {
  const result = poster('', testAction)
  t.is(result, '//episode/poster')
})

test(`poster: it extracts the show poster if episode is not available`, t => {
  delete testAction.payload.poster
  const result = poster('', testAction)
  t.is(result, '//show/poster')
})

test(`poster: it does nothing if not the init action is dispatched`, t => {
  const result = poster('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})

test(`poster: it has a default fallback if a missing state is provided`, t => {
  const result = poster(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, '')
})

test(`poster: it returns null if neither an episode poster nor an show poster is defined`, t => {
  const result = poster('', {
    type: 'INIT',
    payload: {}
  })
  t.is(result, null)
})

// SUBTITLE TESTS
test(`subtitle: it is a reducer function`, t => {
  t.is(typeof subtitle, 'function')
})

test(`subtitle: it extracts the subtitle`, t => {
  const result = subtitle('', testAction)
  t.is(result, 'subtitle')
})

test(`subtitle: it returns null if no subtitle is available`, t => {
  const result = subtitle('foo', {
    type: 'INIT',
    payload: {}
  })
  t.is(result, null)
})

test(`subtitle: it does nothing if not the init action is dispatched`, t => {
  const result = subtitle('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})

test(`subtitle: it has a default fallback if a missing state is provided`, t => {
  const result = subtitle(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, '')
})

// TITLE TESTS
test(`title: it is a reducer function`, t => {
  t.is(typeof title, 'function')
})

test(`title: it extracts the title`, t => {
  const result = title('', testAction)
  t.is(result, 'title')
})

test(`title: it returns null if no title is available`, t => {
  const result = title('foo', {
    type: 'INIT',
    payload: {}
  })
  t.is(result, null)
})

test(`title: it does nothing if not the init action is dispatched`, t => {
  const result = title('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})

test(`title: it has a default fallback if a missing state is provided`, t => {
  const result = title(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, '')
})

// SHOW TITLE TESTS
test(`showTitle: it is a reducer function`, t => {
  t.is(typeof showTitle, 'function')
})

test(`showTitle: it extracts the showTitle`, t => {
  const result = showTitle('', testAction)
  t.is(result, 'showTitle')
})

test(`showTitle: it returns null if no showTitle is available`, t => {
  const result = showTitle('foo', {
    type: 'INIT',
    payload: {}
  })
  t.is(result, null)
})

test(`showTitle: it does nothing if not the init action is dispatched`, t => {
  const result = showTitle('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})

test(`showTitle: it has a default fallback if a missing state is provided`, t => {
  const result = showTitle(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, '')
})

// REFERENCE TESTS
test(`reference: it is a reducer function`, t => {
  t.is(typeof reference, 'function')
})

test(`reference: it extracts the references`, t => {
  const result = reference('', testAction)
  t.deepEqual(result, {
    config: '//config/reference',
    share: '//share/reference',
    origin: '//origin/reference'
  })
})

test(`reference: it returns null if a reference is available`, t => {
  delete testAction.payload.reference.share
  let result = reference('foo', testAction)
  t.deepEqual(result, {
    config: '//config/reference',
    origin: '//origin/reference',
    share: null
  })

  delete testAction.payload.reference.config
  result = reference('foo', testAction)
  t.deepEqual(result, {
    origin: '//origin/reference',
    config: null,
    share: null
  })

  delete testAction.payload.reference.origin
  result = reference('foo', testAction)
  t.deepEqual(result, {
    origin: null,
    config: null,
    share: null
  })
})

test(`reference: it does nothing if not the init action is dispatched`, t => {
  const result = reference('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})

test(`reference: it has a default fallback if a missing state is provided`, t => {
  const result = reference(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.deepEqual(result, {})
})

// MODE TESTS
test(`mode: it is a reducer function`, t => {
  t.is(typeof mode, 'function')
})

test(`mode: it extracts the mode`, t => {
  testAction.payload.mode = 'shared'
  const result = mode('', testAction)
  t.is(result, 'shared')
})

test(`mode: it returns native if a mode is not available`, t => {
  let result = mode(undefined, testAction)
  t.is(result, 'native')
})

test(`mode: it does nothing if not the init action is dispatched`, t => {
  const result = mode('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})