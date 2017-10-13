import test from 'ava'
import { reference, display, mode } from './init'

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
      mode: 'episode',
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

// REFERENCE TESTS
test(`reference: it is a reducer function`, t => {
  t.is(typeof reference, 'function')
})

test(`reference: it extracts the references`, t => {
  const result = reference({}, testAction)
  t.deepEqual(result, {
    config: '//config/reference',
    share: '//share/reference',
    origin: '//origin/reference'
  })
})

test(`reference: it returns null if a reference is available`, t => {
  delete testAction.payload.reference.share
  let result = reference({}, testAction)
  t.deepEqual(result, {
    config: '//config/reference',
    origin: '//origin/reference',
    share: null
  })

  delete testAction.payload.reference.config
  result = reference({}, testAction)
  t.deepEqual(result, {
    origin: '//origin/reference',
    config: null,
    share: null
  })

  delete testAction.payload.reference.origin
  result = reference({}, testAction)
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

test(`mode: it has a default fallback if a missing state is provided`, t => {
  const result = reference(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.deepEqual(result, {})
})

test(`mode: it falls back to default mode if not live`, t => {
  const result = mode(undefined, {
    type: 'INIT',
    payload: {
      mode: 'foobar'
    }
  })
  t.deepEqual(result, 'episode')
})

test(`mode: it sets the provided mode to live`, t => {
  const result = mode(undefined, {
    type: 'INIT',
    payload: {
      mode: 'live'
    }
  })
  t.deepEqual(result, 'live')
})

test(`mode: it does nothing if not the init action is dispatched`, t => {
  const result = mode('foo', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.deepEqual(result, 'foo')
})

test(`mode: it has a default fallback if a missing state is provided`, t => {
  const result = mode(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.deepEqual(result, 'episode')
})

// display TESTS
test(`display: it is a reducer function`, t => {
  t.is(typeof display, 'function')
})

test(`display: it extracts the display`, t => {
  testAction.payload.display = 'embed'
  const result = display('', testAction)
  t.is(result, 'embed')
})

test(`display: it returns native if a display is not available`, t => {
  let result = display(undefined, testAction)
  t.is(result, 'native')
})

test(`display: it does nothing if not the init action is dispatched`, t => {
  const result = display('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})
