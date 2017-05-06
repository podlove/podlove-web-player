import test from 'ava'
import { runtime } from './runtime'

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
      runtime: {
        language: 'en',
        platform: 'desktop'
      }
    }
  }
})

test(`runtime: it is a reducer function`, t => {
  t.is(typeof runtime, 'function')
})

test(`runtime: it extracts the runtime on INIT`, t => {
  const result = runtime('', testAction)
  t.deepEqual(result, {
    language: 'en',
    platform: 'desktop'
  })
})

test(`runtime: it returns an empty object if a runtime is not available`, t => {
  let result = runtime(undefined, {
    type: 'NOT_A_REAL_TYPE'
  })
  t.deepEqual(result, {})
})

test(`runtime: it sets the language in SET_LANGUAGE`, t => {
  let result = runtime({ platform: 'mobile', language: 'en' }, { type: 'SET_LANGUAGE', payload: 'de' })

  t.deepEqual(result, { platform: 'mobile', language: 'de' })
})

test(`runtime: it does nothing if not the init action is dispatched`, t => {
  const result = runtime('foobar', {
    type: 'NOT_A_REAL_TYPE'
  })
  t.is(result, 'foobar')
})
